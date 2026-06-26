import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMS, formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Driving Programs — Confidence Foundation to Roadtrip Ready",
  description:
    "Six structured driving programs mapped to your Steer Score. From Confidence Foundation for new drivers to Roadtrip Ready for mountain roads. Each program builds on the last.",
};

export default function ProgramsPage() {
  return (
    <div className="pt-24 bg-asphalt">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Programs
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              Your score tells you
              <br />
              <span className="text-lime">where to start.</span>
              <br />
              Programs tell you
              <br />
              where to go.
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed mb-8">
              Nobody buys a driving program. They buy the next level of their Steer Score.
              Each program is a milestone on a journey — not a standalone service.
            </p>
            <Link
              href="/score/book"
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
            >
              Take Your Score First — ₹299
            </Link>
          </div>

          {/* Journey map */}
          <div className="mb-16 overflow-x-auto pb-4">
            <div className="flex items-center gap-0 min-w-[600px]">
              {PROGRAMS.map((program, i) => (
                <div key={program.slug} className="flex items-center">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-graphite border-2 border-white/10 group-hover:border-lime flex items-center justify-center transition-all">
                      <span className="font-heading font-black text-xs text-white">{i + 1}</span>
                    </div>
                    <span className="text-[10px] font-ui text-steel text-center max-w-[80px] leading-tight group-hover:text-white transition-colors">
                      {program.name.replace("™", "")}
                    </span>
                  </Link>
                  {i < PROGRAMS.length - 1 && (
                    <div className="w-12 h-px bg-white/10 mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Programs list */}
          <div className="space-y-5">
            {PROGRAMS.map((program) => (
              <Link
                key={program.slug}
                href={`/programs/${program.slug}`}
                className="group block glass rounded-xl p-6 md:p-8 hover:border-lime/20 border border-transparent transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
                        Score {program.scoreRange[0]}–{program.scoreRange[1]}
                      </span>
                      <span className="text-xs font-ui text-steel">
                        {program.sessions} sessions · {program.durationHours} hours
                      </span>
                    </div>
                    <h2 className="font-heading font-black text-2xl text-white uppercase mb-2 group-hover:text-lime transition-colors">
                      {program.name}
                    </h2>
                    <p className="text-white/50 font-body italic text-sm mb-4">
                      &ldquo;{program.tagline}&rdquo;
                    </p>
                    <p className="text-white/60 font-body leading-relaxed max-w-xl">
                      {program.forProfile}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {program.outcomes.slice(0, 2).map((outcome) => (
                        <span key={outcome} className="text-xs font-ui text-white/50 bg-white/5 px-3 py-1.5 rounded">
                          {outcome}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-3xl text-white">
                      {formatINR(program.price)}
                    </p>
                    <p className="text-xs text-steel font-ui">
                      Members: {formatINR(program.memberPrice)}
                    </p>
                    <span className="mt-4 inline-block text-lime font-heading font-black text-sm group-hover:translate-x-1 transition-transform">
                      View Program →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
