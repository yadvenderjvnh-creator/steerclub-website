import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMS, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "My Programs — Dashboard" };

export default function DashboardProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Programs</h1>
        <p className="text-steel text-sm font-ui mt-1">Your program history and upcoming bookings</p>
      </div>

      {/* Active program placeholder */}
      <div className="glass rounded-xl p-6">
        <p className="text-xs font-ui uppercase tracking-widest text-lime mb-3">Active Program</p>
        <h2 className="font-heading font-black text-xl text-white uppercase mb-1">City Mastery™</h2>
        <p className="text-steel font-ui text-sm mb-4">Session 2 of 5 · Chandigarh · July 12, 2026</p>
        <div className="h-1.5 bg-graphite rounded-full overflow-hidden mb-2">
          <div className="h-full bg-lime rounded-full" style={{ width: "40%" }} />
        </div>
        <p className="text-xs text-steel font-ui">40% complete</p>
      </div>

      {/* Available programs */}
      <div>
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide mb-4">
          Recommended Next Programs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMS.slice(2, 4).map((program) => (
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
