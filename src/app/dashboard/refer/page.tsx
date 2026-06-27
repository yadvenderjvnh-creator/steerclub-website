import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { referralCodes, referralRedemptions } from "@/lib/db/schema";
import { getOrCreateReferralCode } from "@/lib/finance/referrals";
import { ReferCopy } from "./refer-copy";

export const dynamic = "force-dynamic";

export default async function ReferPage() {
  const user = await requireUser("/dashboard/refer");
  const code = await getOrCreateReferralCode(user.id);
  const link = `https://steerclub.in/score/book?ref=${code}`;

  const [rc] = await db.select({ id: referralCodes.id }).from(referralCodes).where(eq(referralCodes.userId, user.id)).limit(1);
  const reds = rc
    ? await db
        .select({ id: referralRedemptions.id, email: referralRedemptions.referredEmail, status: referralRedemptions.status, createdAt: referralRedemptions.createdAt })
        .from(referralRedemptions)
        .where(eq(referralRedemptions.referralCodeId, rc.id))
        .orderBy(desc(referralRedemptions.createdAt))
        .limit(50)
    : [];

  const qualified = reds.filter((r) => r.status === "qualified" || r.status === "rewarded").length;

  function maskEmail(e: string | null) {
    if (!e) return "—";
    const [u, d] = e.split("@");
    return `${u.slice(0, 2)}***@${d ?? ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Refer & Earn</p>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Invite friends to the road</h1>
        <p className="text-steel text-sm font-ui mt-1">Share your link. When a friend books their first Steer Score, it counts as a qualified referral.</p>
      </div>

      <div className="glass rounded-xl p-6">
        <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Your referral code</p>
        <p className="font-heading font-black text-3xl text-lime mb-4">{code}</p>
        <ReferCopy link={link} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Friends referred</p>
          <p className="font-heading font-black text-2xl text-white">{reds.length}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Qualified</p>
          <p className="font-heading font-black text-2xl text-lime">{qualified}</p>
        </div>
      </div>

      {reds.length > 0 && (
        <div className="glass rounded-xl divide-y divide-white/5">
          {reds.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <span className="text-white/80 font-ui text-sm">{maskEmail(r.email)}</span>
              <span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${r.status === "pending" ? "border-white/15 text-steel" : "border-lime/40 text-lime bg-lime/10"}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
