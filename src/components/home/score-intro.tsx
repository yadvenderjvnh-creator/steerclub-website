"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const SCORE_BANDS = [
  { range: "0–30", label: "Critical Gap", color: "#EB5757", desc: "Significant technique gaps. Start here." },
  { range: "31–50", label: "Developing", color: "#F2C94C", desc: "Licensed but not capable. The majority." },
  { range: "51–70", label: "Competent", color: "#D7FF2F", desc: "Functional. Room to earn more." },
  { range: "71–85", label: "Capable", color: "#27AE60", desc: "Genuinely skilled. Rare." },
  { range: "86–100", label: "Mastery", color: "#27AE60", desc: "SteerClub certified standard." },
];

const DIMENSIONS = [
  "Vehicle Control",
  "Hazard Perception",
  "City Navigation",
  "Highway Driving",
  "All Conditions",
  "Defensive Driving",
];

export function ScoreIntro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-pad bg-asphalt">
      <div className="container max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              The Steer Score™
            </p>
            <h2 className="font-heading font-black text-section text-white uppercase mb-6">
              What score would you
              <br />
              <span className="text-lime">give yourself?</span>
            </h2>
            <p className="text-white/70 font-body text-lg leading-relaxed mb-6">
              The Steer Score is India's first proprietary benchmark for driving competence.
              It measures six real-world driving dimensions — not whether you can pass a test.
            </p>
            <p className="text-white/60 font-body leading-relaxed mb-8">
              Every driver who comes to SteerClub starts with a 30-minute in-vehicle assessment.
              The Score tells you where you actually are, why it matters, and exactly what to do next.
            </p>
            <div className="mb-8">
              <p className="text-xs text-steel font-ui uppercase tracking-widest mb-3">
                What the Score measures
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DIMENSIONS.map((d) => (
                  <div key={d} className="flex items-center gap-2 text-sm text-white/70 font-ui">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime/60 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/score/how-it-works"
              className="inline-flex items-center gap-2 text-lime font-heading font-black text-sm tracking-wide uppercase hover:gap-3 transition-all"
            >
              How it works →
            </Link>
          </motion.div>

          {/* Right: Score bands visual */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="space-y-3"
          >
            {SCORE_BANDS.map((band, i) => (
              <motion.div
                key={band.range}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-heading font-black text-xs text-asphalt flex-shrink-0"
                  style={{ backgroundColor: band.color }}
                >
                  {band.range}
                </div>
                <div>
                  <p className="font-heading font-black text-sm text-white uppercase tracking-wide">
                    {band.label}
                  </p>
                  <p className="text-xs text-steel font-ui mt-0.5">{band.desc}</p>
                </div>
              </motion.div>
            ))}

            <div className="mt-6 glass rounded-xl p-5 text-center">
              <p className="text-steel text-xs font-ui uppercase tracking-widest mb-1">
                National average
              </p>
              <p className="font-heading font-black text-4xl text-white">58</p>
              <p className="text-xs text-steel font-ui mt-1">
                Based on 1,000+ assessments
              </p>
              <Link
                href="/score/book"
                className="mt-4 inline-block w-full bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-3 hover:bg-lime/90 transition-colors"
              >
                Find Out Your Score
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
