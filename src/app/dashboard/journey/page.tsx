import type { Metadata } from "next";
import Link from "next/link";
import { Check, Lock, CircleDot } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getLatestScore, getUserPrograms } from "@/lib/portal/queries";
import { PROGRAMS, getRecommendedProgram } from "@/lib/utils";

export const metadata: Metadata = { title: "My Journey — Dashboard" };
export const dynamic = "force-dynamic";

type State = "done" | "active" | "locked";

export default async function JourneyPage() {
  const user = await requireUser();
  const [{ latest }, programs] = await Promise.all([getLatestScore(user), getUserPrograms(user)]);

  const completed = new Set(
    programs.filter((p) => p.status === "completed").map((p) => p.programSlug)
  );
  const hasScore = Boolean(latest);
  const recSlug = latest ? getRecommendedProgram(latest.total).slug : null;
  const allDone = PROGRAMS.every((p) => completed.has(p.slug));

  const milestones: { key: string; name: string; sub: string; state: State; href?: string }[] = [
    {
      key: "assessment",
      name: "Steer Score Assessment",
      sub: hasScore ? `Scored ${latest!.total}/100` : "Find out where you stand",
      state: hasScore ? "done" : "active",
      href: "/score/book",
    },
    ...PROGRAMS.map((p) => {
      const state: State = completed.has(p.slug)
        ? "done"
        : p.slug === recSlug && hasScore
          ? "active"
          : "locked";
      return {
        key: p.slug,
        name: p.name,
        sub: p.tagline,
        state,
        href: `/programs/${p.slug}`,
      };
    }),
    {
      key: "certified",
      name: "Steer Certified™",
      sub: "Earn the Road.",
      state: (allDone ? "done" : "locked") as State,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          My Journey
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">The Road Ahead</h1>
      </div>

      <div className="relative">
        {/* vertical connector */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-white/10" />
        <ul className="space-y-2">
          {milestones.map((m) => {
            const node =
              m.state === "done" ? (
                <span className="w-10 h-10 rounded-full bg-lime text-asphalt flex items-center justify-center shrink-0 relative z-10">
                  <Check className="w-5 h-5" />
                </span>
              ) : m.state === "active" ? (
                <span className="w-10 h-10 rounded-full bg-lime/10 border-2 border-lime text-lime flex items-center justify-center shrink-0 relative z-10">
                  <CircleDot className="w-5 h-5" />
                </span>
              ) : (
                <span className="w-10 h-10 rounded-full bg-graphite border border-white/10 text-steel flex items-center justify-center shrink-0 relative z-10">
                  <Lock className="w-4 h-4" />
                </span>
              );

            const inner = (
              <div
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  m.state === "locked" ? "opacity-50" : "hover:bg-white/5"
                }`}
              >
                {node}
                <div className="min-w-0">
                  <p className="font-heading font-black text-white uppercase text-sm">{m.name}</p>
                  <p className="text-xs text-steel font-ui truncate">{m.sub}</p>
                </div>
                {m.state === "active" && (
                  <span className="ml-auto text-[10px] font-ui uppercase tracking-widest text-lime bg-lime/10 px-2 py-1 rounded">
                    Next
                  </span>
                )}
                {m.state === "done" && (
                  <span className="ml-auto text-[10px] font-ui uppercase tracking-widest text-lime">
                    Done
                  </span>
                )}
              </div>
            );

            return (
              <li key={m.key}>
                {m.href && m.state !== "locked" ? <Link href={m.href}>{inner}</Link> : inner}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
