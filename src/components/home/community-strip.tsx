"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CITIES = [
  { name: "Chandigarh", members: "120+", chapter: "chandigarh" },
  { name: "Delhi NCR", members: "340+", chapter: "delhi" },
  { name: "Bangalore", members: "280+", chapter: "bangalore" },
  { name: "Mumbai", members: "195+", chapter: "mumbai" },
  { name: "Hyderabad", members: "Coming soon", chapter: "hyderabad" },
  { name: "Pune", members: "Coming soon", chapter: "pune" },
];

export function CommunityStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-pad bg-graphite">
      <div className="container max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Community
            </p>
            <h2 className="font-heading font-black text-section text-white uppercase mb-6">
              Everyone here had to
              <br />
              <span className="text-lime">earn their place.</span>
              <br />
              Including you.
            </h2>
            <p className="text-white/60 font-body text-lg leading-relaxed mb-6">
              A SteerClub member is not defined by age, gender, or how long they've been driving.
              They're defined by one decision: the decision that the license was not enough.
            </p>
            <p className="text-white/50 font-body leading-relaxed mb-10">
              Monthly city drives. Skill workshops. Annual road trips.
              The community is the product — programs are just how you get in.
            </p>
            <div className="flex gap-4">
              <Link
                href="/community"
                className="bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:bg-lime/90 transition-colors"
              >
                Explore Community
              </Link>
              <Link
                href="/membership"
                className="border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:border-white/50 transition-colors"
              >
                Membership →
              </Link>
            </div>
          </motion.div>

          {/* Right: city chapters */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {CITIES.map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
              >
                <Link
                  href={`/community/${city.chapter}`}
                  className="block glass rounded-xl p-5 hover-lift hover:border-lime/20 border border-transparent transition-all group"
                >
                  <p className="font-heading font-black text-base text-white uppercase group-hover:text-lime transition-colors">
                    {city.name}
                  </p>
                  <p className="text-xs text-steel font-ui mt-1">{city.members} members</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
