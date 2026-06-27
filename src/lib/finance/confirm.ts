import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assessmentBookings, programBookings, eventRegistrations, events, users } from "@/lib/db/schema";
import { markLeadConverted } from "@/lib/portal/leads";
import { notifyUserByEmail } from "@/lib/portal/notify";
import { persistMembership, persistGift, membershipAmount } from "./persist";
import { ensureInvoice } from "@/lib/billing/invoices";
import { getProgramBySlug } from "@/lib/utils";

export type ConfirmParams = {
  type: string; // assessment | program | event | membership | gift
  paymentId: string;
  orderId?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  tier?: string;
  billing?: string;
  giftType?: string;
  programSlug?: string;
  eventSlug?: string;
  buyerName?: string | null;
  buyerEmail?: string | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
};

const NOTIF_TITLE: Record<string, string> = {
  membership: "Membership active",
  program: "Program seat reserved",
  gift: "Gift sent",
  event: "You're registered",
  assessment: "Assessment confirmed",
};

/**
 * Idempotently confirm/persist a paid booking of any type. Shared by the client
 * verify route and the Razorpay webhook so both paths produce identical results.
 */
export async function confirmPaidBooking(p: ConfirmParams): Promise<void> {
  const payerEmail = p.type === "gift" ? p.buyerEmail : p.email;
  await markLeadConverted(payerEmail);
  await notifyUserByEmail(payerEmail, {
    type: "booking",
    title: NOTIF_TITLE[p.type] ?? "Payment received",
    body: "Payment received — check your dashboard for details.",
    link: "/dashboard",
  });

  if (p.type === "assessment") {
    if (p.email) {
      const updated = await db
        .update(assessmentBookings)
        .set({
          status: "confirmed",
          razorpayOrderId: p.orderId ?? undefined,
          razorpayPaymentId: p.paymentId,
          confirmedAt: new Date(),
        })
        .where(and(eq(assessmentBookings.email, p.email), eq(assessmentBookings.status, "pending")))
        .returning({ id: assessmentBookings.id, amount: assessmentBookings.amount });
      if (updated[0]) {
        await ensureInvoice({ source: "assessment", bookingId: updated[0].id, email: p.email, item: "Steer Score Assessment", amount: updated[0].amount });
      }
    }
  } else if (p.type === "program") {
    if (p.email) {
      const [pending] = await db
        .select({ id: programBookings.id, amount: programBookings.amount })
        .from(programBookings)
        .where(and(eq(programBookings.email, p.email), eq(programBookings.status, "pending")))
        .orderBy(desc(programBookings.createdAt))
        .limit(1);
      if (pending) {
        await db
          .update(programBookings)
          .set({ status: "confirmed", razorpayOrderId: p.orderId ?? undefined, razorpayPaymentId: p.paymentId })
          .where(eq(programBookings.id, pending.id));
        await ensureInvoice({ source: "program", bookingId: pending.id, email: p.email, item: "SteerClub Program", amount: pending.amount });
      }
    }
  } else if (p.type === "event") {
    if (p.email && p.eventSlug) {
      const email = p.email.toLowerCase().trim();
      const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      const [ev] = await db.select({ id: events.id, title: events.title }).from(events).where(eq(events.slug, p.eventSlug)).limit(1);
      if (u && ev) {
        const updated = await db
          .update(eventRegistrations)
          .set({ status: "confirmed", razorpayOrderId: p.orderId ?? undefined, razorpayPaymentId: p.paymentId })
          .where(
            and(
              eq(eventRegistrations.userId, u.id),
              eq(eventRegistrations.eventId, ev.id),
              eq(eventRegistrations.status, "pending")
            )
          )
          .returning({ id: eventRegistrations.id, amount: eventRegistrations.amount });
        if (updated[0] && (updated[0].amount ?? 0) > 0) {
          await ensureInvoice({ source: "event", bookingId: updated[0].id, email, userId: u.id, item: ev.title, amount: updated[0].amount ?? 0 });
        }
      }
    }
  } else if (p.type === "membership") {
    if (p.email && p.tier) {
      const m = await persistMembership({
        email: p.email,
        name: p.name,
        phone: p.phone,
        tier: p.tier,
        billing: p.billing ?? "annual",
        paymentId: p.paymentId,
      });
      if (m) {
        await ensureInvoice({ source: "membership", bookingId: m.id, email: p.email, userId: m.userId, item: `SteerClub Membership — ${p.tier}`, amount: m.amount });
      }
    }
  } else if (p.type === "gift") {
    const giftType = p.giftType ?? "membership";
    let amount = 0;
    let refId: string | null = null;
    if (giftType === "membership") {
      refId = p.tier ?? null;
      amount = membershipAmount(p.tier ?? "", "annual") ?? 0;
    } else if (giftType === "program") {
      const program = getProgramBySlug(p.programSlug ?? "");
      refId = program?.slug ?? null;
      amount = program?.price ?? 0;
    }
    const g = await persistGift({
      giftType,
      refId,
      amount,
      buyerName: p.buyerName,
      buyerEmail: p.buyerEmail,
      recipientName: p.recipientName,
      recipientEmail: p.recipientEmail,
      paymentId: p.paymentId,
    });
    if (g && amount > 0) {
      await ensureInvoice({ source: "gift", bookingId: g.id, email: p.buyerEmail, item: `Gift — ${giftType}`, amount });
    }
  }
}
