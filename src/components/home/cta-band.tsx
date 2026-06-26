"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CTABand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 bg-lime">
      <div className="container max-w-[1440px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="font-heading font-black text-asphalt/60 text-xs tracking-[0.25em] uppercase mb-4">
            The only question that matters
          </p>
          <h2
            className="font-heading font-black text-asphalt uppercase mb-6"
            style={{ fontSize: "clamp(40px,6vw,80px)", lineHeight: 1, letterSpacing: "-0.03em" }}
          >
            What score would
            <br />
            you give yourself?
          </h2>
          <p className="text-asphalt/70 font-body text-xl mb-10 max-w-lg mx-auto">
            Now let's find out what it actually is.
            <br />
            30 minutes. A certified instructor. The honest answer.
          </p>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-asphalt text-white font-heading font-black text-base tracking-wide uppercase px-10 py-5 hover:bg-graphite transition-colors hover:scale-[1.02] transition-transform"
          >
            Book Your Assessment — ₹299
          </Link>
          <p className="mt-4 text-asphalt/50 text-xs font-ui">
            Free cancellation up to 24 hours before. Score shared only with you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
