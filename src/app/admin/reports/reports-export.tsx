"use client";

import { Download } from "lucide-react";

type ExportData = {
  revenueTrend: { label: string; revenue: number }[];
  sourceBreakdown: { source: string; amount: number; count: number }[];
  leadSources: { source: string; count: number }[];
  topCoupons: { code: string; used: number; discounted: number }[];
};

export function ReportsExport({ data }: { data: ExportData }) {
  function exportCsv() {
    const lines: string[] = [];
    lines.push("Revenue trend");
    lines.push("Week,Revenue (₹)");
    data.revenueTrend.forEach((r) => lines.push(`${r.label},${r.revenue}`));
    lines.push("");
    lines.push("Revenue by source");
    lines.push("Source,Amount (₹),Count");
    data.sourceBreakdown.forEach((r) => lines.push(`${r.source},${r.amount},${r.count}`));
    lines.push("");
    lines.push("Lead sources");
    lines.push("Source,Count");
    data.leadSources.forEach((r) => lines.push(`${r.source},${r.count}`));
    lines.push("");
    lines.push("Top coupons");
    lines.push("Code,Used,Discounted (₹)");
    data.topCoupons.forEach((r) => lines.push(`${r.code},${r.used},${r.discounted}`));

    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `steerclub-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button onClick={exportCsv} className="inline-flex items-center gap-1.5 border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">
        <Download className="w-3.5 h-3.5" /> CSV
      </button>
      <a href="/admin/reports/pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5">
        <Download className="w-3.5 h-3.5" /> PDF
      </a>
    </div>
  );
}
