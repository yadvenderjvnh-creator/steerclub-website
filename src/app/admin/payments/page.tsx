import { desc, eq } from "drizzle-orm";
import { IndianRupee, Clock, RotateCcw } from "lucide-react";
import { db } from "@/lib/db";
import { assessmentBookings, programBookings, programs } from "@/lib/db/schema";
import { StatCard } from "@/components/admin/stat-card";
import { formatINR } from "@/lib/utils";
import { PaymentsTable, type PaymentRow } from "./payments-table";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const PAID = ["confirmed", "completed"] as const;

export default async function PaymentsPage() {
  await requireRole(["admin"]);
  const [asmt, progs] = await Promise.all([
    db.select().from(assessmentBookings).orderBy(desc(assessmentBookings.createdAt)),
    db
      .select({
        id: programBookings.id,
        name: programBookings.name,
        email: programBookings.email,
        amount: programBookings.amount,
        status: programBookings.status,
        razorpayPaymentId: programBookings.razorpayPaymentId,
        createdAt: programBookings.createdAt,
        programName: programs.name,
      })
      .from(programBookings)
      .leftJoin(programs, eq(programBookings.programId, programs.id))
      .orderBy(desc(programBookings.createdAt)),
  ]);

  const all = [
    ...asmt.map((b) => ({
      id: b.id,
      item: "Steer Score Assessment",
      name: b.name,
      email: b.email,
      amount: b.amount,
      status: b.status,
      paymentId: b.razorpayPaymentId,
      createdAt: b.createdAt,
    })),
    ...progs.map((b) => ({
      id: b.id,
      item: b.programName ?? "Program",
      name: b.name,
      email: b.email,
      amount: b.amount,
      status: b.status,
      paymentId: b.razorpayPaymentId,
      createdAt: b.createdAt,
    })),
  ];

  const revenue = all.filter((r) => PAID.includes(r.status as (typeof PAID)[number])).reduce((s, r) => s + r.amount, 0);
  const outstanding = all.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const refunded = all.filter((r) => r.status === "refunded").reduce((s, r) => s + r.amount, 0);

  const rows: PaymentRow[] = all
    .map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Finance
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatINR(revenue)} icon={IndianRupee} accent />
        <StatCard label="Outstanding" value={formatINR(outstanding)} sub="pending bookings" icon={Clock} />
        <StatCard label="Refunded" value={formatINR(refunded)} icon={RotateCcw} />
      </div>

      <PaymentsTable rows={rows} />
    </div>
  );
}
