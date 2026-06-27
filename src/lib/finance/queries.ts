import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  assessmentBookings,
  programBookings,
  programs,
  eventRegistrations,
  events,
  memberships,
  giftPurchases,
  users,
  refunds,
} from "@/lib/db/schema";

export type FinanceSource = "assessment" | "program" | "event" | "membership" | "gift";

export type FinanceRow = {
  id: string;
  source: FinanceSource;
  item: string;
  name: string | null;
  email: string | null;
  amount: number; // paise
  status: string;
  paid: boolean;
  paymentId: string | null;
  createdAt: Date;
};

const PAID_BOOKING = new Set(["confirmed", "completed"]);
const PAID_MEMBERSHIP = new Set(["active", "cancelled", "expired"]); // all imply a completed payment

/** Every payment across all sources, newest first, each tagged with a normalized `paid` flag. */
export async function getAllPayments(): Promise<FinanceRow[]> {
  const [asmt, progs, evts, mems, gifts] = await Promise.all([
    db.select().from(assessmentBookings).orderBy(desc(assessmentBookings.createdAt)),
    db
      .select({
        id: programBookings.id,
        name: programBookings.name,
        email: programBookings.email,
        amount: programBookings.amount,
        status: programBookings.status,
        paymentId: programBookings.razorpayPaymentId,
        createdAt: programBookings.createdAt,
        programName: programs.name,
      })
      .from(programBookings)
      .leftJoin(programs, eq(programBookings.programId, programs.id))
      .orderBy(desc(programBookings.createdAt)),
    db
      .select({
        id: eventRegistrations.id,
        name: users.name,
        email: users.email,
        amount: eventRegistrations.amount,
        status: eventRegistrations.status,
        paymentId: eventRegistrations.razorpayPaymentId,
        createdAt: eventRegistrations.createdAt,
        title: events.title,
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(eventRegistrations.eventId, events.id))
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .orderBy(desc(eventRegistrations.createdAt)),
    db
      .select({
        id: memberships.id,
        name: users.name,
        email: users.email,
        amount: memberships.amount,
        status: memberships.status,
        paymentId: memberships.razorpayPaymentId,
        createdAt: memberships.createdAt,
        tier: memberships.tier,
      })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .orderBy(desc(memberships.createdAt)),
    db.select().from(giftPurchases).orderBy(desc(giftPurchases.createdAt)),
  ]);

  const rows: FinanceRow[] = [
    ...asmt.map((b) => ({
      id: b.id,
      source: "assessment" as const,
      item: "Steer Score Assessment",
      name: b.name,
      email: b.email,
      amount: b.amount,
      status: b.status,
      paid: PAID_BOOKING.has(b.status),
      paymentId: b.razorpayPaymentId,
      createdAt: b.createdAt,
    })),
    ...progs.map((b) => ({
      id: b.id,
      source: "program" as const,
      item: b.programName ?? "Program",
      name: b.name,
      email: b.email,
      amount: b.amount,
      status: b.status,
      paid: PAID_BOOKING.has(b.status),
      paymentId: b.paymentId,
      createdAt: b.createdAt,
    })),
    ...evts.map((b) => ({
      id: b.id,
      source: "event" as const,
      item: b.title,
      name: b.name,
      email: b.email,
      amount: b.amount ?? 0,
      status: b.status,
      paid: PAID_BOOKING.has(b.status) && (b.amount ?? 0) > 0,
      paymentId: b.paymentId,
      createdAt: b.createdAt,
    })),
    ...mems.map((b) => ({
      id: b.id,
      source: "membership" as const,
      item: `Membership — ${b.tier}`,
      name: b.name,
      email: b.email,
      amount: b.amount ?? 0,
      status: b.status,
      paid: PAID_MEMBERSHIP.has(b.status) && (b.amount ?? 0) > 0,
      paymentId: b.paymentId,
      createdAt: b.createdAt,
    })),
    ...gifts.map((b) => ({
      id: b.id,
      source: "gift" as const,
      item: `Gift — ${b.type}`,
      name: b.buyerName,
      email: b.buyerEmail,
      amount: b.amount,
      status: b.razorpayPaymentId ? "confirmed" : "pending",
      paid: Boolean(b.razorpayPaymentId),
      paymentId: b.razorpayPaymentId,
      createdAt: b.createdAt,
    })),
  ];

  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export type RevenueSummary = {
  revenue: number;
  outstanding: number;
  refunded: number;
  paidCount: number;
};

/** All-time revenue/outstanding/refunded across every source (+ refunds table). */
export async function getRevenueSummary(rows?: FinanceRow[]): Promise<RevenueSummary> {
  const all = rows ?? (await getAllPayments());
  const revenue = all.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0);
  const outstanding = all.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const [ref] = await db
    .select({ s: sql<number>`coalesce(sum(${refunds.amount}),0)::int` })
    .from(refunds)
    .where(eq(refunds.status, "processed"));
  const refunded = ref?.s ?? 0;
  return { revenue, outstanding, refunded, paidCount: all.filter((r) => r.paid).length };
}

/** Sum of paid revenue with createdAt in [from, to). */
export function revenueBetween(rows: FinanceRow[], from: Date, to?: Date): number {
  return rows
    .filter((r) => r.paid && r.createdAt >= from && (!to || r.createdAt < to))
    .reduce((s, r) => s + r.amount, 0);
}
