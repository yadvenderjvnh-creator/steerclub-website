import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserPrograms, getLatestScore, getUserSessions, getUserCertificates } from "@/lib/portal/queries";
import { getRecommendedProgram, PROGRAMS, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "My Programs — Dashboard" };
export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-300",
  confirmed: "text-lime",
  completed: "text-green-400",
  cancelled: "text-red-300",
  refunded: "text-white/50",
};

export default async function DashboardProgramsPage() {
  const user = await requireUser();
  const [{ latest }, programsList, sessions, certs] = await Promise.all([
    getLatestScore(user),
    getUserPrograms(user),
    getUserSessions(user),
    getUserCertificates(user),
  ]);

  // Session progress per program name.
  const progress = new Map<string, { total: number; done: number }>();
  for (const s of sessions) {
    const p = progress.get(s.programName) ?? { total: 0, done: 0 };
    p.total += 1;
    if (s.status === "completed") p.done += 1;
    progress.set(s.programName, p);
  }
  const certByProgram = new Map(certs.map((c) => [c.programName, c]));

  const active = programsList.filter((p) => ["pending", "confirmed"].includes(p.status));
  const completed = programsList.filter((p) => p.status === "completed");
  const rec = latest ? getRecommendedProgram(latest.total) : PROGRAMS[0];
  const recommended = PROGRAMS.filter((p) => p.slug !== rec.slug).slice(0, 2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Programs</h1>
        <p className="text-steel text-sm font-ui mt-1">Your program history and what&apos;s next</p>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-sm text-lime uppercase tracking-widest mb-4">Active</h2>
          <div className="space-y-3">
            {active.map((p) => {
              const prog = p.programName ? progress.get(p.programName) : undefined;
              const pct = prog && prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
              return (
                <div key={p.id} className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-heading font-black text-white uppercase">{p.programName ?? "Program"}</p>
                    <span className={`text-xs font-ui uppercase capitalize ${STATUS_COLOR[p.status] ?? "text-white/60"}`}>{p.status}</span>
                  </div>
                  {prog ? (
                    <>
                      <div className="h-1.5 bg-graphite rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-lime rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-steel font-ui">{prog.done} of {prog.total} sessions · {pct}% complete</p>
                    </>
                  ) : (
                    <p className="text-xs text-steel font-ui">Awaiting cohort scheduling — we&apos;ll confirm your sessions soon.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest mb-4">Completed</h2>
          <div className="space-y-3">
            {completed.map((p) => {
              const cert = p.programName ? certByProgram.get(p.programName) : undefined;
              return (
                <div key={p.id} className="glass rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-black text-white uppercase">{p.programName ?? "Program"}</p>
                    <p className="text-xs text-green-400 font-ui mt-0.5">Completed</p>
                  </div>
                  {cert ? (
                    <a href={`/dashboard/programs/${p.id}/certificate`} className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-xs uppercase px-4 py-2 rounded hover:border-lime/50 hover:text-lime transition-all">
                      <Download className="w-3.5 h-3.5" /> Certificate
                    </a>
                  ) : (
                    <span className="text-xs text-steel font-ui">Certificate processing</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest mb-4">
          {latest ? "Recommended For You" : "Programs"}
        </h2>
        {latest && (
          <Link href={`/programs/${rec.slug}/book`} className="group block glass rounded-xl p-6 hover-lift hover:border-lime/20 border border-lime/10 transition-all mb-4">
            <span className="text-xs font-ui text-lime bg-lime/10 px-2 py-1 rounded mb-3 inline-block">Based on your score {latest.total}</span>
            <h3 className="font-heading font-black text-xl text-white uppercase mb-1 group-hover:text-lime transition-colors">{rec.name}</h3>
            <p className="text-sm text-white/50 font-body italic mb-3">&ldquo;{rec.tagline}&rdquo;</p>
            <div className="flex items-center justify-between">
              <span className="font-heading font-black text-white">{formatINR(rec.memberPrice)}</span>
              <span className="text-[10px] text-lime font-ui bg-lime/10 px-2 py-0.5 rounded">Member price</span>
            </div>
          </Link>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommended.map((program) => (
            <Link key={program.slug} href={`/programs/${program.slug}`} className="group block glass rounded-xl p-5 hover-lift hover:border-lime/20 border border-transparent transition-all">
              <span className="text-xs font-ui text-lime bg-lime/10 px-2 py-1 rounded mb-3 inline-block">Score {program.scoreRange[0]}+</span>
              <h3 className="font-heading font-black text-base text-white uppercase mb-1 group-hover:text-lime transition-colors">{program.name}</h3>
              <p className="text-xs text-steel font-ui mb-3">{program.sessions} sessions · {program.durationHours}h</p>
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-white">{formatINR(program.memberPrice)}</span>
                <span className="text-[10px] text-lime font-ui bg-lime/10 px-2 py-0.5 rounded">Member price</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
