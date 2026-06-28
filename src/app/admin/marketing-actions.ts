"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { coupons, campaigns, activityLog } from "@/lib/db/schema";
import { dispatchCampaign } from "@/lib/marketing/dispatch";
import { sendEmail } from "@/lib/email";

export type CouponInput = {
  code: string;
  type: "flat" | "percent";
  value: number; // rupees (flat) or percent
  minAmount?: number; // rupees
  appliesTo: "all" | "assessment" | "program" | "event" | "membership";
  validTo?: string | null; // ISO date
  usageLimit?: number | null;
};

export async function createCoupon(input: CouponInput): Promise<{ ok: boolean; error?: string }> {
  const admin = await requirePermission("marketing.write");
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Code required." };
  if (input.type === "percent" && (input.value < 1 || input.value > 100)) return { ok: false, error: "Percent must be 1–100." };

  try {
    await db.insert(coupons).values({
      code,
      type: input.type,
      value: input.type === "flat" ? Math.round(input.value * 100) : Math.round(input.value),
      minAmount: input.minAmount ? Math.round(input.minAmount * 100) : 0,
      appliesTo: input.appliesTo,
      validTo: input.validTo ? new Date(input.validTo) : null,
      usageLimit: input.usageLimit ?? null,
      isActive: true,
    });
    await db.insert(activityLog).values({ actorId: admin.id, action: "coupon.create", entity: "coupon", entityId: code });
  } catch {
    return { ok: false, error: "A coupon with that code already exists." };
  }
  revalidatePath("/admin/marketing");
  return { ok: true };
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const admin = await requirePermission("marketing.write");
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
  await db.insert(activityLog).values({ actorId: admin.id, action: isActive ? "coupon.enable" : "coupon.disable", entity: "coupon", entityId: id });
  revalidatePath("/admin/marketing");
}

export async function deleteCoupon(id: string) {
  const admin = await requirePermission("marketing.write");
  await db.delete(coupons).where(eq(coupons.id, id));
  await db.insert(activityLog).values({ actorId: admin.id, action: "coupon.delete", entity: "coupon", entityId: id });
  revalidatePath("/admin/marketing");
}

// ---------- Campaigns ----------
export type CampaignInput = {
  name: string;
  channel: "email" | "whatsapp" | "push";
  segment: string;
  subject?: string;
  body: string;
  scheduledAt?: string | null; // ISO; null = send now/draft
};

function renderBody(body: string, name: string | null) {
  return body.replace(/\{\{\s*name\s*\}\}/gi, name || "there");
}

export async function createCampaign(input: CampaignInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const admin = await requirePermission("marketing.write");
  if (!input.name || !input.body || !input.segment) return { ok: false, error: "Name, segment and body are required." };
  const [row] = await db
    .insert(campaigns)
    .values({
      name: input.name,
      channel: input.channel,
      segment: input.segment,
      subject: input.subject ?? null,
      body: input.body,
      status: input.scheduledAt ? "scheduled" : "draft",
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      createdById: admin.id,
    })
    .returning({ id: campaigns.id });
  await db.insert(activityLog).values({ actorId: admin.id, action: "campaign.create", entity: "campaign", entityId: row.id });
  revalidatePath("/admin/marketing");
  return { ok: true, id: row.id };
}

export async function sendTestCampaign(input: { subject?: string; body: string; toEmail: string }): Promise<{ ok: boolean }> {
  await requirePermission("marketing.write");
  const ok = await sendEmail({
    to: input.toEmail,
    subject: `[TEST] ${input.subject ?? "SteerClub"}`,
    html: renderBody(input.body, "there"),
  });
  return { ok };
}

/** Dispatch a campaign now: email channel sends via Resend; whatsapp/push are no-op stubs. */
export async function sendCampaignNow(id: string): Promise<{ ok: boolean; sent?: number; error?: string }> {
  const admin = await requirePermission("marketing.write");
  const [c] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!c) return { ok: false, error: "Campaign not found." };
  if (c.status === "sent") return { ok: false, error: "Already sent." };

  if (c.channel !== "email") {
    // WhatsApp/push are scaffolded but not yet configured.
    await db.update(campaigns).set({ status: "sent", sentAt: new Date(), stats: { recipients: 0, sent: 0, failed: 0 } }).where(eq(campaigns.id, id));
    revalidatePath("/admin/marketing");
    return { ok: false, error: `${c.channel} channel isn't configured yet — nothing sent.` };
  }

  const { sent, failed } = await dispatchCampaign(id);
  await db.insert(activityLog).values({ actorId: admin.id, action: "campaign.send", entity: "campaign", entityId: id, meta: { sent, failed } });
  revalidatePath("/admin/marketing");
  return { ok: true, sent };
}

export async function deleteCampaign(id: string) {
  const admin = await requirePermission("marketing.write");
  await db.delete(campaigns).where(eq(campaigns.id, id));
  await db.insert(activityLog).values({ actorId: admin.id, action: "campaign.delete", entity: "campaign", entityId: id });
  revalidatePath("/admin/marketing");
}
