import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getScores, getUserPrograms, deriveBadges } from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Achievements — Dashboard" };
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const user = await requireUser();
  const [scores, programs] = await Promise.all([getScores(user), getUserPrograms(user)]);

  const topScore = scores.reduce((m, s) => Math.max(m, s.total), 0);
  const completedProgramSlugs = programs
    .filter((p) => p.status === "completed" && p.programSlug)
    .map((p) => p.programSlug as string);

  const badges = deriveBadges({
    hasScore: scores.length > 0,
    topScore,
    completedProgramSlugs,
  });

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Achievements</h1>
        <p className="text-steel text-sm font-ui mt-1">
          {earned.length} of {badges.length} earned
        </p>
      </div>

      <div>
        <h2 className="font-heading font-black text-xs text-lime uppercase tracking-widest mb-4">Earned</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {earned.map((badge) => (
            <div key={badge.id} className="glass rounded-xl p-5 text-center">
              <span className="text-3xl mb-3 block">{badge.icon}</span>
              <p className="font-heading font-black text-sm text-white uppercase">{badge.name}</p>
              <p className="text-xs text-steel font-ui mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {locked.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-xs text-steel uppercase tracking-widest mb-4">Locked</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {locked.map((badge) => (
              <div key={badge.id} className="glass rounded-xl p-5 text-center opacity-40">
                <span className="text-3xl mb-3 block grayscale">{badge.icon}</span>
                <p className="font-heading font-black text-sm text-white uppercase">{badge.name}</p>
                <p className="text-xs text-steel font-ui mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
