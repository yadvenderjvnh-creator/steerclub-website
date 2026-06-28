"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  assessmentBookings,
  programBookings,
  eventRegistrations,
  memberships,
  refunds,
  invoices,
  activityLog,
} from "@/lib/db/schema";
import { refundPayment } from "@/lib/razorpay";
import { notifyUserByEmail } from "@/lib/portal/notify";

type Source = "assessment" | "program" | "event" | "membership" | "gift";

/** Flip the source booking to a refunded/cancelled status. */
async function markSourceRefunded(source: Source, bookingId: string) {
  if (source === "assessment") {
    await db.update(assessmentBookings).set({ status: "refunded" }).where(eq(assessmentBookings.id, bookingId));
  } else if (source === "program") {
    await db.update(programBookings).set({ status: "refunded" }).where(eq(programBookings.id, bookingId));
  } else if (source === "event") {
    await db.update(eventRegistrations).set({ status: "refunded" }).where(eq(eventRegistrations.id, bookingId));
  } else if (source === "membership") {
    await db.update(memberships).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(memberships.id, bookingId));
  }
  // gift: no status column — the refunds row is the record of truth.
}

/** Issue a Razorpay refund, record it, flip the booking, notify the customer. Admin-only, audited. */
export async function issueRefund(input: {
  source: Source;
  bookingId: string;
  paymentId: string | null;
  amount: number; // paise
  email?: string | null;
  reason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const admin = await requirePermission("payments.refund");
  if (!input.paymentId) return { ok: false, error: "No Razorpay payment id on this booking." };

  let razorpayRefundId: string | null = null;
  let status: "processed" | "failed" = "processed";
  try {
    const refund = await refundPayment(input.paymentId, input.amount, {
      source: input.source,
      bookingId: input.bookingId,
    });
    razorpayRefundId = (refund as { id?: string })?.id ?? null;
  } catch (err) {
    console.error("refundPayment failed:", err);
    status = "failed";
  }

  await db.insert(refunds).values({
    source: input.source,
    bookingId: input.bookingId,
    paymentId: input.paymentId,
    amount: input.amount,
    reason: input.reason ?? null,
    status,
    razorpayRefundId,
    createdById: admin.id,
  });

  if (status === "failed") {
    return { ok: false, error: "Razorpay refund failed — recorded as failed. Check the payment in the Razorpay dashboard." };
  }

  await markSourceRefunded(input.source, input.bookingId);
  await db
    .update(invoices)
    .set({ status: "refunded" })
    .where(and(eq(invoices.source, input.source), eq(invoices.bookingId, input.bookingId)));
  await db.insert(activityLog).values({
    actorId: admin.id,
    action: "payment.refund",
    entity: input.source,
    entityId: input.bookingId,
    meta: { amount: input.amount, razorpayRefundId },
  });
  if (input.email) {
    await notifyUserByEmail(input.email, {
      type: "refund",
      title: "Refund processed",
      body: "Your payment has been refunded. It may take 5–7 business days to reflect.",
      link: "/dashboard/payments",
    });
  }

  revalidatePath("/admin/payments");
  return { ok: true };
}
