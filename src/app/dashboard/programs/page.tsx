import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getUserPrograms, getLatestScore } from "@/lib/portal/queries";
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
  const [{ latest }, programs] = await Promise.all([getLatestScore(user), getUserPrograms(user)]);

  const active = programs.filter((p) => ["pending", "confirmed"].includes(p.status));
  const completed = programs.filter((p) => p.status === "completed");
  const rec = latest ? getRecommendedProgram(latest.total) : PROGRAMS[0];
  const recommended = PROGRAMS.filter((p) => p.slug !== rec.slug).slice(0, 2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Programs</h1>
        <p className="text-steel text-sm font-ui mt-1">Your program history and what&apos;s next</p>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-sm text-lime uppercase tracking-widest mb-4">Active</h2>
          <div className="space-y-3">
            {active.map((p) => (
              <div key={p.id} className="glass rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-heading font-black text-white uppercase">{p.programName ?? "Program"}</p>
                  <p className="text-xs text-steel font-ui mt-0.5">
                    Booked {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <span className={`text-xs font-ui uppercase tracking-wide capitalize ${STATUS_COLOR[p.status] ?? "text-white/60"}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest mb-4">Completed</h2>
          <div className="space-y-3">
            {completed.map((p) => (
              <div key={p.id} className="glass rounded-xl p-5 flex items-center justify-between">
                <p className="font-heading font-black text-white uppercase">{p.programName ?? "Program"}</p>
                <span className="text-xs font-ui uppercase tracking-wide text-green-400">Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      <div>
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-widest mb-4">
          {latest ? "Recommended For You" : "Programs"}
        </h2>
        {latest && (
          <Link
            href={`/programs/${rec.slug}/book`}
            className="group block glass rounded-xl p-6 hover-lift hover:border-lime/20 border border-lime/10 transition-all mb-4"
          >
            <span className="text-xs font-ui text-lime bg-lime/10 px-2 py-1 rounded mb-3 inline-block">
              Based on your score {latest.total}
            </span>
            <h3 className="font-heading font-black text-xl text-white uppercase mb-1 group-hover:text-lime transition-colors">
              {rec.name}
            </h3>
            <p className="text-sm text-white/50 font-body italic mb-3">&ldquo;{rec.tagline}&rdquo;</p>
            <div className="flex items-center justify-between">
              <span className="font-heading font-black text-white">{formatINR(rec.memberPrice)}</span>
              <span className="text-[10px] text-lime font-ui bg-lime/10 px-2 py-0.5 rounded">Member price</span>
            </div>
          </Link>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommended.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="group block glass rounded-xl p-5 hover-lift hover:border-lime/20 border border-transparent transition-all"
            >
              <span className="text-xs font-ui text-lime bg-lime/10 px-2 py-1 rounded mb-3 inline-block">
                Score {program.scoreRange[0]}+
              </span>
              <h3 className="font-heading font-black text-base text-white uppercase mb-1 group-hover:text-lime transition-colors">
                {program.name}
              </h3>
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
