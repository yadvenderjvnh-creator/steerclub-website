import { IndianRupee, Clock, RotateCcw } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { formatINR } from "@/lib/utils";
import { PaymentsTable, type PaymentRow } from "./payments-table";
import { requirePermission } from "@/lib/auth/session";
import { getAllPayments, getRevenueSummary } from "@/lib/finance/queries";
import { getAllInvoices } from "@/lib/billing/invoices";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requirePermission("payments.read");
  const [all, invoices] = await Promise.all([getAllPayments(), getAllInvoices()]);
  const { revenue, outstanding, refunded } = await getRevenueSummary(all);

  const invoiceByBooking = new Map(invoices.map((i) => [`${i.source}:${i.bookingId}`, i.id]));

  const rows: PaymentRow[] = all.map((r) => ({
    id: r.id,
    source: r.source,
    item: r.item,
    name: r.name ?? "—",
    email: r.email ?? "—",
    amount: r.amount,
    status: r.status,
    paymentId: r.paymentId,
    invoiceId: invoiceByBooking.get(`${r.source}:${r.id}`) ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

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
