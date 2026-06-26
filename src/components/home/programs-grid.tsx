"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { PROGRAMS, formatINR } from "@/lib/utils";

export function ProgramsGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-pad bg-lgrey">
      <div className="container max-w-[1440px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
            Programs
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="font-heading font-black text-section text-white uppercase">
              Your score tells you
              <br />
              <span className="text-lime">where to start.</span>
            </h2>
            <Link
              href="/programs"
              className="text-sm font-heading font-black text-white/60 uppercase tracking-wide hover:text-white transition-colors flex items-center gap-1"
            >
              All programs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PROGRAMS.map((program, i) => (
            <motion.div
              key={program.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={`/programs/${program.slug}`}
                className="group block glass rounded-xl p-6 hover-lift hover:border-lime/20 border border-transparent transition-all duration-300 h-full"
              >
                {/* Score range badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-ui uppercase tracking-widest text-steel">
                    Score {program.scoreRange[0]}–{program.scoreRange[1] ?? "100"}
                  </span>
                  <span className="text-xs font-ui text-steel">
                    {program.sessions} sessions · {program.durationHours}h
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-heading font-black text-xl text-white uppercase mb-2 group-hover:text-lime transition-colors">
                  {program.name}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-white/60 font-body italic mb-4 leading-relaxed">
                  &ldquo;{program.tagline}&rdquo;
                </p>

                {/* For profile */}
                <p className="text-sm text-white/50 font-body leading-relaxed mb-6 line-clamp-3">
                  {program.forProfile}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <p className="font-heading font-black text-xl text-white">
                      {formatINR(program.price)}
                    </p>
                    <p className="text-xs text-steel font-ui">
                      Members pay {formatINR(program.memberPrice)}
                    </p>
                  </div>
                  <span className="text-lime font-heading font-black text-sm group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Not sure card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: PROGRAMS.length * 0.08 }}
          >
            <Link
              href="/score/book"
              className="group block rounded-xl p-6 border-2 border-dashed border-white/15 hover:border-lime/40 transition-all duration-300 h-full flex flex-col items-center justify-center text-center min-h-[240px]"
            >
              <p className="text-lime font-heading font-black text-xs tracking-[0.2em] uppercase mb-3">
                Not sure where to start?
              </p>
              <h3 className="font-heading font-black text-xl text-white uppercase mb-3">
                Take Your
                <br />
                Steer Score
              </h3>
              <p className="text-sm text-white/50 font-body mb-5">
                30 minutes. The score tells you exactly which program you need.
              </p>
              <span className="bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 group-hover:scale-105 transition-transform inline-block">
                Book Assessment — ₹299
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
