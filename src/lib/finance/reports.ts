import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, coupons, couponRedemptions } from "@/lib/db/schema";
import { getAllPayments, type FinanceRow } from "./queries";

export type ReportData = {
  kpis: { totalRevenue: number; paidCount: number; avgOrder: number };
  revenueTrend: { label: string; revenue: number }[];
  sourceBreakdown: { source: string; amount: number; count: number }[];
  funnel: { leads: number; assessmentCustomers: number; programCustomers: number };
  leadSources: { source: string; count: number }[];
  topCoupons: { code: string; used: number; discounted: number }[];
};

/** Last `weeks` ISO-week buckets of paid revenue. */
function revenueByWeek(rows: FinanceRow[], weeks = 8): { label: string; revenue: number }[] {
  const now = new Date();
  const buckets: { label: string; start: number; end: number; revenue: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    buckets.push({
      label: end.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      start: start.getTime(),
      end: end.getTime(),
      revenue: 0,
    });
  }
  for (const r of rows) {
    if (!r.paid) continue;
    const t = r.createdAt.getTime();
    const b = buckets.find((x) => t > x.start && t <= x.end);
    if (b) b.revenue += r.amount;
  }
  return buckets.map((b) => ({ label: b.label, revenue: Math.round(b.revenue / 100) }));
}

export async function getReportData(): Promise<ReportData> {
  const payments = await getAllPayments();
  const paid = payments.filter((p) => p.paid);

  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0);
  const paidCount = paid.length;
  const avgOrder = paidCount ? Math.round(totalRevenue / paidCount) : 0;

  // Source breakdown.
  const bySource = new Map<string, { amount: number; count: number }>();
  for (const p of paid) {
    const cur = bySource.get(p.source) ?? { amount: 0, count: 0 };
    cur.amount += p.amount;
    cur.count += 1;
    bySource.set(p.source, cur);
  }
  const sourceBreakdown = [...bySource.entries()].map(([source, v]) => ({ source, amount: Math.round(v.amount / 100), count: v.count }));

  // Funnel: leads → assessment customers → program customers (distinct paid emails).
  const [{ c: leadCount } = { c: 0 }] = await db.select({ c: sql<number>`count(*)::int` }).from(leads);
  const assessmentEmails = new Set(paid.filter((p) => p.source === "assessment").map((p) => (p.email ?? "").toLowerCase()));
  const programEmails = new Set(paid.filter((p) => p.source === "program").map((p) => (p.email ?? "").toLowerCase()));

  // Lead sources.
  const leadSrcRows = await db
    .select({ source: leads.source, c: sql<number>`count(*)::int` })
    .from(leads)
    .groupBy(leads.source);
  const leadSources = leadSrcRows
    .map((r) => ({ source: r.source ?? "unknown", count: r.c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top coupons by redemptions.
  const couponRows = await db
    .select({
      code: coupons.code,
      used: coupons.usedCount,
      discounted: sql<number>`coalesce((select sum(${couponRedemptions.amountDiscounted}) from ${couponRedemptions} where ${couponRedemptions.couponId} = ${coupons.id}),0)::int`,
    })
    .from(coupons)
    .orderBy(sql`${coupons.usedCount} desc`)
    .limit(8);
  const topCoupons = couponRows.map((c) => ({ code: c.code, used: c.used, discounted: Math.round((c.discounted ?? 0) / 100) }));

  return {
    kpis: { totalRevenue, paidCount, avgOrder },
    revenueTrend: revenueByWeek(payments),
    sourceBreakdown,
    funnel: { leads: leadCount, assessmentCustomers: assessmentEmails.size, programCustomers: programEmails.size },
    leadSources,
    topCoupons,
  };
}
