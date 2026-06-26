"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!headlineRef.current) return;
    gsap.fromTo(
      headlineRef.current.querySelectorAll(".word"),
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 1.0, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-asphalt">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-asphalt/80 via-asphalt/60 to-asphalt pointer-events-none z-10" />

      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(215,255,47,0.5) 80px,
            rgba(215,255,47,0.5) 81px
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-20 container max-w-[1440px] text-center px-6 py-32">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-8"
        >
          India's Driving Confidence Platform
        </motion.p>

        {/* Main headline */}
        <h1
          ref={headlineRef}
          className="font-heading font-black text-hero text-white uppercase leading-none mb-6 overflow-hidden"
          style={{ letterSpacing: "-0.03em" }}
        >
          <span className="block overflow-hidden">
            <span className="word inline-block">Drive</span>{" "}
            <span className="word inline-block text-lime">Skills.</span>
          </span>
          <span className="block overflow-hidden">
            <span className="word inline-block">Own the</span>{" "}
            <span className="word inline-block">Road.</span>
          </span>
        </h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-white/60 font-body text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed"
        >
          India has 300 million licensed drivers.
          <br />
          Almost none of them were actually taught to drive.
          <br />
          <span className="text-white/90">Your Steer Score tells you where you stand.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all hover:scale-[1.02] min-w-[220px] justify-center"
          >
            Take Your Score — ₹299
          </Link>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:border-white/50 transition-all min-w-[220px] justify-center"
          >
            See Programs →
          </Link>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-steel font-ui uppercase tracking-widest"
        >
          {[
            "25+ Drivers Coached",
            "0 Incidents",
            "6 Structured Levels",
            "Chandigarh · Delhi · Bangalore",
          ].map((stat) => (
            <span key={stat} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-lime/60 inline-block" />
              {stat}
            </span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-lime/60 to-transparent mx-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
