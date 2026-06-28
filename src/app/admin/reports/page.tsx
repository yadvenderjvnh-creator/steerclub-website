import { IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { getReportData } from "@/lib/finance/reports";
import { StatCard } from "@/components/admin/stat-card";
import { formatINR } from "@/lib/utils";
import { RevenueLineChart, SourceDonut, LeadSourceBars } from "@/components/admin/charts";
import { ReportsExport } from "./reports-export";

export const dynamic = "force-dynamic";

const PALETTE = ["#D7FF2F", "#7CC4FF", "#FF9F6B", "#B68CFF", "#5BE0A0", "#FF7AA2"];

export default async function AdminReportsPage() {
  await requirePermission("reports.read");
  const data = await getReportData();

  const conv1 = data.funnel.leads ? Math.round((data.funnel.assessmentCustomers / data.funnel.leads) * 100) : 0;
  const conv2 = data.funnel.assessmentCustomers ? Math.round((data.funnel.programCustomers / data.funnel.assessmentCustomers) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Analytics</p>
          <h1 className="font-heading font-black text-3xl text-white uppercase">Reports</h1>
          <p className="text-steel text-sm font-ui mt-1">Revenue, conversion and acquisition across the business.</p>
        </div>
        <ReportsExport data={data} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={formatINR(data.kpis.totalRevenue)} icon={IndianRupee} accent />
        <StatCard label="Paid Orders" value={data.kpis.paidCount} icon={ShoppingBag} />
        <StatCard label="Avg Order Value" value={formatINR(data.kpis.avgOrder)} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Revenue — last 8 weeks</h2>
          <RevenueLineChart data={data.revenueTrend} />
        </div>
        <div className="glass rounded-xl p-5">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Revenue by source</h2>
          {data.sourceBreakdown.length === 0 ? (
            <p className="text-steel font-ui text-sm">No paid revenue yet.</p>
          ) : (
            <>
              <SourceDonut data={data.sourceBreakdown} />
              <div className="mt-3 space-y-1.5">
                {data.sourceBreakdown.map((s, i) => (
                  <div key={s.source} className="flex items-center justify-between text-xs font-ui">
                    <span className="flex items-center gap-2 text-white/70 capitalize">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                      {s.source}
                    </span>
                    <span className="text-white/80">₹{s.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Conversion funnel</h2>
          <div className="space-y-3">
            <FunnelRow label="Leads" value={data.funnel.leads} pct={100} />
            <FunnelRow label="Assessment customers" value={data.funnel.assessmentCustomers} pct={data.funnel.leads ? (data.funnel.assessmentCustomers / data.funnel.leads) * 100 : 0} note={`${conv1}% of leads`} />
            <FunnelRow label="Program customers" value={data.funnel.programCustomers} pct={data.funnel.leads ? (data.funnel.programCustomers / data.funnel.leads) * 100 : 0} note={`${conv2}% of assessment customers`} />
          </div>
        </div>
        <div className="glass rounded-xl p-5">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Lead sources</h2>
          {data.leadSources.length === 0 ? <p className="text-steel font-ui text-sm">No leads yet.</p> : <LeadSourceBars data={data.leadSources} />}
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Top coupons</h2>
        {data.topCoupons.length === 0 ? (
          <p className="text-steel font-ui text-sm">No coupons yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-steel">
                {["Code", "Redemptions", "Total discounted"].map((h) => <th key={h} className="text-left font-ui text-xs uppercase tracking-widest py-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.topCoupons.map((c) => (
                <tr key={c.code} className="border-t border-white/5">
                  <td className="py-2 text-white font-heading font-black">{c.code}</td>
                  <td className="py-2 text-white/70">{c.used}</td>
                  <td className="py-2 text-white/70">₹{c.discounted.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FunnelRow({ label, value, pct, note }: { label: string; value: number; pct: number; note?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white/80 font-ui text-sm">{label}</span>
        <span className="text-white font-heading font-black text-sm">{value}{note && <span className="text-steel font-ui font-normal text-xs ml-2">{note}</span>}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-lime" style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}
