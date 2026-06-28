import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons, campaigns, referralCodes, referralRedemptions, users } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { SEGMENTS } from "@/lib/marketing/segments";
import { MarketingManager, type CouponRow, type ReferrerRow, type CampaignRow } from "./marketing-manager";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const admin = await requirePermission("marketing.write");

  const [couponRows, campaignRows, referrerRows] = await Promise.all([
    db.select().from(coupons).orderBy(desc(coupons.createdAt)),
    db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(50),
    db
      .select({
        code: referralCodes.code,
        name: users.name,
        email: users.email,
        total: sql<number>`(select count(*) from referral_redemptions rr where rr.referral_code_id = ${referralCodes.id})::int`,
        qualified: sql<number>`(select count(*) from referral_redemptions rr where rr.referral_code_id = ${referralCodes.id} and rr.status in ('qualified','rewarded'))::int`,
      })
      .from(referralCodes)
      .innerJoin(users, eq(referralCodes.userId, users.id))
      .orderBy(desc(referralCodes.createdAt))
      .limit(100),
  ]);

  const couponData: CouponRow[] = couponRows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minAmount: c.minAmount ?? 0,
    appliesTo: c.appliesTo,
    usedCount: c.usedCount,
    usageLimit: c.usageLimit,
    isActive: c.isActive,
    validTo: c.validTo ? c.validTo.toISOString() : null,
  }));

  const referrers: ReferrerRow[] = referrerRows
    .map((r) => ({ code: r.code, name: r.name, email: r.email, total: r.total, qualified: r.qualified }))
    .sort((a, b) => b.qualified - a.qualified);

  const campaignData: CampaignRow[] = campaignRows.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
    segment: c.segment,
    status: c.status,
    sentAt: c.sentAt ? c.sentAt.toISOString() : null,
    stats: c.stats ?? null,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Growth</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Marketing</h1>
        <p className="text-steel text-sm font-ui mt-1">Campaigns, coupons and referrals.</p>
      </div>
      <MarketingManager
        coupons={couponData}
        referrers={referrers}
        campaigns={campaignData}
        segments={SEGMENTS}
        adminEmail={admin.email}
      />
    </div>
  );
}
