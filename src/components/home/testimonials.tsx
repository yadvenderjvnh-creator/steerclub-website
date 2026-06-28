"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export type TestimonialItem = {
  name: string;
  city: string | null;
  quote: string;
  program?: string | null;
  scoreFrom?: number | null;
  scoreTo?: number | null;
};

const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Priya Mehta",
    city: "Chandigarh",
    scoreFrom: 44,
    scoreTo: 79,
    program: "City Mastery™",
    quote: "I had a license for four years and hadn't touched a car. My Steer Score was 44. I thought that meant I was hopeless. City Mastery gave me back something I didn't even know I'd lost.",
  },
  {
    name: "Arjun Sharma",
    city: "Delhi",
    scoreFrom: 61,
    scoreTo: 83,
    program: "Highway Freedom™",
    quote: "I drive 80km every day. Thought I was good. The assessment said 61. Ego check — and then the best driving I've done in fifteen years of being on the road.",
  },
  {
    name: "Kavya Iyer",
    city: "Bangalore",
    scoreFrom: 38,
    scoreTo: 67,
    program: "Confidence Foundation™",
    quote: "The cohort format was everything. Eight of us, all in the same place, all starting together. I'd have quit after the first session if I'd been alone. With the group, I didn't.",
  },
  {
    name: "Rohan Verma",
    city: "Chandigarh",
    scoreFrom: 72,
    scoreTo: 91,
    program: "Roadtrip Ready™",
    quote: "I'd been planning Spiti for three years. Roadtrip Ready didn't just prepare me for the road — it gave me the confidence that I'd actually know what to do when things went wrong. And they did. And I did.",
  },
];

export function Testimonials({ items }: { items?: TestimonialItem[] }) {
  const data = items && items.length > 0 ? items : TESTIMONIALS;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-pad bg-asphalt overflow-hidden">
      <div className="container max-w-[1440px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
            Member Stories
          </p>
          <h2 className="font-heading font-black text-section text-white uppercase">
            Real scores.
            <br />
            <span className="text-lime">Real roads.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-7"
            >
              {/* Score change (only when present) */}
              {t.scoreFrom != null && t.scoreTo != null ? (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-3xl text-steel">{t.scoreFrom}</span>
                    <span className="text-steel text-sm">→</span>
                    <span className="font-heading font-black text-3xl text-lime">{t.scoreTo}</span>
                  </div>
                  <div>
                    {t.program && <p className="text-xs font-ui uppercase tracking-widest text-steel">{t.program}</p>}
                    <p className="text-xs font-ui text-steel/60">{t.city}</p>
                  </div>
                </div>
              ) : (
                t.city && <p className="text-xs font-ui uppercase tracking-widest text-steel mb-4">{t.city}</p>
              )}

              {/* Quote */}
              <blockquote className="text-white/80 font-body text-base leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Name */}
              <p className="mt-5 font-heading font-black text-sm text-white uppercase tracking-wide">
                — {t.name}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <a
            href="/community/member-stories"
            className="text-sm font-heading font-black text-white/50 uppercase tracking-wide hover:text-lime transition-colors"
          >
            Read more stories →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
