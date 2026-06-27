import { and, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { referralCodes, referralRedemptions, users } from "@/lib/db/schema";

function makeCode(): string {
  return `SC${randomBytes(3).toString("hex").toUpperCase()}`; // e.g. SC9F3A2C
}

/** Get this member's referral code, creating one on first use. */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const [existing] = await db.select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1);
  if (existing) return existing.code;
  for (let i = 0; i < 4; i++) {
    const code = makeCode();
    try {
      await db.insert(referralCodes).values({ userId, code });
      return code;
    } catch {
      const [again] = await db.select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.userId, userId)).limit(1);
      if (again) return again.code;
    }
  }
  return makeCode();
}

/** Record a pending referral when a friend checks out with a ?ref code. Idempotent, no self-referral. */
export async function captureReferral(code: string | undefined | null, referredEmail: string | undefined | null, source?: string): Promise<void> {
  if (!code || !referredEmail) return;
  try {
    const c = code.trim().toUpperCase();
    const email = referredEmail.toLowerCase().trim();
    const [rc] = await db.select({ id: referralCodes.id, userId: referralCodes.userId }).from(referralCodes).where(eq(referralCodes.code, c)).limit(1);
    if (!rc) return;

    // No self-referral.
    const [owner] = await db.select({ email: users.email }).from(users).where(eq(users.id, rc.userId)).limit(1);
    if (owner && owner.email.toLowerCase() === email) return;

    const [dupe] = await db
      .select({ id: referralRedemptions.id })
      .from(referralRedemptions)
      .where(and(eq(referralRedemptions.referralCodeId, rc.id), eq(referralRedemptions.referredEmail, email)))
      .limit(1);
    if (dupe) return;

    await db.insert(referralRedemptions).values({ referralCodeId: rc.id, referredEmail: email, source: source ?? null, status: "pending" });
  } catch (err) {
    console.error("captureReferral failed:", err);
  }
}

/** Mark a referred friend's pending referral as qualified once they pay. */
export async function qualifyReferral(email: string | null, source: string, bookingId: string): Promise<void> {
  if (!email) return;
  try {
    const e = email.toLowerCase().trim();
    await db
      .update(referralRedemptions)
      .set({ status: "qualified", source, bookingId })
      .where(and(eq(referralRedemptions.referredEmail, e), eq(referralRedemptions.status, "pending")));
  } catch (err) {
    console.error("qualifyReferral failed:", err);
  }
}
