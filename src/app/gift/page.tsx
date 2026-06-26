import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Star, Zap } from "lucide-react";
import { PROGRAMS, formatINR, MEMBERSHIP_PLANS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gift a Program or Membership — SteerClub",
  description:
    "Give the gift of genuine capability. Gift a Steer Score Assessment, a program, or a membership. Instant digital delivery. Physical gift cards for Pro and Select.",
};

const GIFT_OPTIONS = [
  {
    icon: Zap,
    title: "Gift a Steer Score Assessment",
    description: "The best possible starting point. The score reveals everything — and what to do next.",
    price: 29900,
    cta: "Gift Assessment — ₹299",
    href: "/score/book?gift=true",
    highlight: false,
  },
  {
    icon: Star,
    title: "Gift a Program",
    description: "Choose any program from Confidence Foundation to Roadtrip Ready. The recipient chooses their cohort date.",
    price: null,
    cta: "Choose Program →",
    href: "#programs",
    highlight: true,
  },
  {
    icon: Gift,
    title: "Gift a Membership",
    description: "A year of community, events, and progress. Member or Pro. Comes with a digital gift card.",
    price: null,
    cta: "Choose Membership →",
    href: "#membership",
    highlight: false,
  },
];

export default function GiftPage() {
  return (
    <div className="pt-24 bg-asphalt">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Gift a SteerClub Experience
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              Coaching came first.
              <br />
              <span className="text-lime">Give them what we built.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              The most useful gift for someone who drives — or wants to.
              Assessment, program, or membership. They choose when. You give the why.
            </p>
          </div>

          {/* Gift type selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
            {GIFT_OPTIONS.map(({ icon: Icon, title, description, price, cta, href, highlight }) => (
              <div
                key={title}
                className={`rounded-2xl p-7 flex flex-col ${
                  highlight ? "bg-lime text-asphalt" : "glass"
                }`}
              >
                <Icon className={`w-8 h-8 mb-5 ${highlight ? "text-asphalt" : "text-lime"}`} />
                <h2
                  className={`font-heading font-black text-xl uppercase mb-3 ${
                    highlight ? "text-asphalt" : "text-white"
                  }`}
                >
                  {title}
                </h2>
                <p
                  className={`font-body text-sm leading-relaxed flex-1 mb-6 ${
                    highlight ? "text-asphalt/70" : "text-white/60"
                  }`}
                >
                  {description}
                </p>
                {price && (
                  <p
                    className={`font-heading font-black text-2xl mb-4 ${
                      highlight ? "text-asphalt" : "text-white"
                    }`}
                  >
                    {formatINR(price)}
                  </p>
                )}
                <Link
                  href={href}
                  className={`block text-center font-heading font-black text-sm tracking-wide uppercase py-3 transition-colors ${
                    highlight
                      ? "bg-asphalt text-white hover:bg-graphite"
                      : "bg-lime text-asphalt hover:bg-lime/90"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Programs */}
          <div id="programs" className="mb-20">
            <h2 className="font-heading font-black text-2xl text-white uppercase mb-8">
              Gift a Program
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROGRAMS.map((program) => (
                <Link
                  key={program.slug}
                  href={`/programs/${program.slug}/book?gift=true`}
                  className="group block glass rounded-xl p-5 hover-lift hover:border-lime/20 border border-transparent transition-all"
                >
                  <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-2 py-1 rounded mb-3 inline-block">
                    Score {program.scoreRange[0]}+
                  </span>
                  <h3 className="font-heading font-black text-base text-white uppercase mb-1 group-hover:text-lime transition-colors">
                    {program.name}
                  </h3>
                  <p className="text-xs text-steel font-body italic mb-3">"{program.tagline}"</p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-lg text-white">{formatINR(program.price)}</span>
                    <span className="text-lime font-heading font-black text-xs group-hover:translate-x-0.5 transition-transform">Gift →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Memberships */}
          <div id="membership">
            <h2 className="font-heading font-black text-2xl text-white uppercase mb-8">
              Gift a Membership
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {MEMBERSHIP_PLANS.filter((p) => p.tier === "member" || p.tier === "pro").map((plan) => (
                <Link
                  key={plan.tier}
                  href={`/membership/${plan.tier}/gift`}
                  className="group block glass rounded-xl p-6 hover-lift hover:border-lime/20 border border-transparent transition-all"
                >
                  <h3 className="font-heading font-black text-xl text-white uppercase mb-1 group-hover:text-lime transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-white/50 font-body text-sm mb-4 italic">"{plan.tagline}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-black text-2xl text-white">{formatINR(plan.annualPrice)}/year</p>
                      {plan.monthlyPrice && (
                        <p className="text-xs text-steel font-ui">or {formatINR(plan.monthlyPrice)}/month</p>
                      )}
                    </div>
                    <span className="bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 py-2 group-hover:scale-105 transition-transform">
                      Gift →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Parent note */}
          <div className="mt-16 bg-lgrey rounded-2xl p-8 md:p-10">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Buying for your son or daughter?
            </p>
            <h3 className="font-heading font-black text-xl text-white uppercase mb-3">
              What to expect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Dual-control vehicles on all Confidence Foundation sessions",
                "Certified instructors with background verification",
                "Structured 4–5 session curriculum, not ad-hoc lessons",
                "Optional progress updates (student-consented only)",
                "Score report shared — you see the before and after",
                "Cohort of peers at the same level — never singled out",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0 mt-2" />
                  <p className="text-white/70 font-body text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
