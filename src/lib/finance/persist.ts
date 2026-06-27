import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, memberships, giftPurchases } from "@/lib/db/schema";
import { PRICES } from "@/lib/razorpay";

type Tier = "member" | "pro" | "select";
type Billing = "monthly" | "annual";

/** Paise for a membership tier/billing combo (mirrors create-order). null = invalid. */
export function membershipAmount(tier: string, billing: string): number | null {
  const map: Record<Tier, { monthly: number | null; annual: number }> = {
    member: { monthly: PRICES.membershipMemberMonthly, annual: PRICES.membershipMemberAnnual },
    pro: { monthly: PRICES.membershipProMonthly, annual: PRICES.membershipProAnnual },
    select: { monthly: null, annual: PRICES.membershipSelectAnnual },
  };
  const plan = map[tier as Tier];
  if (!plan) return null;
  return billing === "monthly" ? plan.monthly : plan.annual;
}

/** Find a user by email or create a minimal client account. Returns the user id. */
async function findOrCreateUser(email: string, name?: string | null, phone?: string | null): Promise<string> {
  const e = email.toLowerCase().trim();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, e)).limit(1);
  if (existing) return existing.id;
  const [created] = await db
    .insert(users)
    .values({ email: e, name: name ?? e.split("@")[0], phone: phone ?? null, role: "client" })
    .returning({ id: users.id });
  return created.id;
}

/** Persist a confirmed membership purchase (find-or-create the buyer's account). Idempotent-ish per payment. */
export async function persistMembership(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
  tier: string;
  billing: string;
  paymentId: string;
}): Promise<{ id: string; amount: number; userId: string } | null> {
  const amount = membershipAmount(input.tier, input.billing);
  if (amount === null) return null;
  const isAnnual = input.billing !== "monthly";

  // Don't double-insert for the same payment.
  const [dupe] = await db
    .select({ id: memberships.id, amount: memberships.amount, userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.razorpayPaymentId, input.paymentId))
    .limit(1);
  if (dupe) return { id: dupe.id, amount: dupe.amount ?? amount, userId: dupe.userId };

  const userId = await findOrCreateUser(input.email, input.name, input.phone);
  const start = new Date();
  const end = new Date(start);
  if (isAnnual) end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  const [row] = await db
    .insert(memberships)
    .values({
      userId,
      tier: input.tier as Tier,
      status: "active",
      startDate: start,
      endDate: end,
      isAnnual,
      amount,
      razorpayPaymentId: input.paymentId,
    })
    .returning({ id: memberships.id });
  return { id: row.id, amount, userId };
}

/** Persist a confirmed gift purchase with a redeemable code. Idempotent per payment. */
export async function persistGift(input: {
  giftType: string; // membership | program
  refId: string | null; // tier or program slug
  amount: number;
  buyerName?: string | null;
  buyerEmail?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  paymentId: string;
}): Promise<{ id: string; code: string } | null> {
  const [dupe] = await db
    .select({ id: giftPurchases.id, code: giftPurchases.code })
    .from(giftPurchases)
    .where(eq(giftPurchases.razorpayPaymentId, input.paymentId))
    .limit(1);
  if (dupe) return { id: dupe.id, code: dupe.code };

  const code = `GIFT-${randomBytes(4).toString("hex").toUpperCase()}`;
  const [row] = await db
    .insert(giftPurchases)
    .values({
      type: input.giftType,
      refId: input.refId,
      amount: input.amount,
      code,
      buyerName: input.buyerName ?? null,
      buyerEmail: input.buyerEmail ?? null,
      recipientName: input.recipientName ?? null,
      recipientEmail: input.recipientEmail ?? null,
      razorpayPaymentId: input.paymentId,
    })
    .returning({ id: giftPurchases.id });
  return { id: row.id, code };
}
