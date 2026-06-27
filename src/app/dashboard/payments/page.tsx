import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getUserPayments } from "@/lib/portal/queries";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments — Dashboard" };
export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-300",
  confirmed: "text-lime",
  completed: "text-green-400",
  cancelled: "text-red-300",
  refunded: "text-white/50",
};

const PAID = ["confirmed", "completed"];

export default async function DashboardPaymentsPage() {
  const user = await requireUser();
  const payments = await getUserPayments(user);

  const totalPaid = payments.filter((p) => PAID.includes(p.status)).reduce((s, p) => s + p.amount, 0);
  const dues = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Payments</h1>
        <p className="text-steel text-sm font-ui mt-1">Your receipts and dues</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Total Paid</p>
          <p className="font-heading font-black text-2xl text-white">{formatINR(totalPaid)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Pending</p>
          <p className="font-heading font-black text-2xl text-white">{formatINR(dues)}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="font-heading font-black text-white uppercase mb-2">No payments yet</p>
          <p className="text-white/50 font-body text-sm mb-6">
            Your assessment and program receipts will appear here.
          </p>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm uppercase px-6 py-3 hover:bg-lime/90 transition-colors"
          >
            Take Your Score — ₹299
          </Link>
        </div>
      ) : (
        <div className="glass rounded-xl divide-y divide-white/5">
          {payments.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-white font-ui">{p.item}</p>
                <p className="text-xs text-steel font-ui mt-0.5">
                  {new Date(p.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {p.paymentId && ` · ${p.paymentId}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-heading font-black text-white">{formatINR(p.amount)}</p>
                <p className={`text-xs font-ui uppercase capitalize ${STATUS_COLOR[p.status] ?? "text-white/60"}`}>
                  {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
