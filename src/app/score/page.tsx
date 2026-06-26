import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Steer Score™ — India's Driving Competence Benchmark",
  description:
    "Find out where you actually stand as a driver. The Steer Score is a 30-minute in-vehicle assessment that measures 6 real-world driving dimensions. Book yours for ₹299.",
  openGraph: {
    title: "What's your Steer Score?",
    description: "India's first driving competence benchmark. Find out where you actually stand.",
  },
};

const DIMENSIONS = [
  {
    name: "Vehicle Control",
    desc: "Clutch, brakes, steering input, spatial awareness. The foundation.",
    weight: "20%",
  },
  {
    name: "Hazard Perception",
    desc: "Reading the road 3–5 seconds ahead. Anticipating, not reacting.",
    weight: "20%",
  },
  {
    name: "City Navigation",
    desc: "Intersections, roundabouts, lanes, parking, peak-hour flow.",
    weight: "18%",
  },
  {
    name: "Highway Driving",
    desc: "Merging, sustained speed, lane discipline, overtaking safely.",
    weight: "18%",
  },
  {
    name: "All Conditions",
    desc: "Rain, night, low-visibility, varied road surface response.",
    weight: "12%",
  },
  {
    name: "Defensive Driving",
    desc: "Buffer space, speed management, unpredictable-traffic response.",
    weight: "12%",
  },
];

const FAQ = [
  {
    q: "Is this like an RTO test?",
    a: "No. The RTO test checks whether you can follow rules. The Steer Score measures whether you can handle reality — traffic, conditions, hazards, and sustained driving situations that an RTO evaluator never sees.",
  },
  {
    q: "What car do we use?",
    a: "We can use your car or a SteerClub vehicle. The assessment protocol is standardised across both. We note the car type in your report.",
  },
  {
    q: "What if I score very low?",
    a: "42% of first-year drivers score below 50. That's not failure — it's the starting point. The score is contextualised with national averages and gives you a clear recommended next step. No shame. Just data.",
  },
  {
    q: "Is my score shared with anyone?",
    a: "Your Steer Score is yours. It is shared only with you and your instructor. You choose whether to share it. We never share individual scores without consent.",
  },
  {
    q: "How long does the assessment take?",
    a: "30 minutes in-vehicle, plus 15 minutes for debrief and score report review. Plan for about 1 hour total.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Full refund if you cancel 24 hours or more before your assessment. Rescheduling is free, once.",
  },
];

export default function ScorePage() {
  return (
    <div className="pt-24 pb-0 bg-asphalt">
      {/* Hero */}
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          <div className="max-w-3xl">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              The Steer Score™
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              What score would you
              <br />
              give yourself as a driver?
              <br />
              <span className="text-lime">Now let's find out.</span>
            </h1>
            <p className="text-white/70 font-body text-xl leading-relaxed mb-8 max-w-2xl">
              The Steer Score is India's first proprietary benchmark for driving competence.
              Not a test you pass or fail. A number that tells you exactly where you are —
              and what to do about it.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/score/book"
                className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all hover:scale-[1.02]"
              >
                Book Your Assessment — ₹299
              </Link>
              <Link
                href="/score/how-it-works"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:border-white/50 transition-all"
              >
                How It Works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      <section className="py-12 border-y border-white/8">
        <div className="container max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "30", unit: "min", label: "In-vehicle assessment" },
              { num: "6", unit: "", label: "Dimensions measured" },
              { num: "58", unit: "/100", label: "National average score" },
              { num: "₹299", unit: "", label: "Assessment fee" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-heading font-black text-4xl md:text-5xl text-white">
                  {item.num}
                  <span className="text-lime text-2xl">{item.unit}</span>
                </p>
                <p className="text-xs text-steel font-ui uppercase tracking-widest mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dimensions */}
      <section className="section-pad bg-lgrey">
        <div className="container max-w-[1440px]">
          <div className="mb-12">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              What gets measured
            </p>
            <h2 className="font-heading font-black text-section text-white uppercase">
              Six dimensions.
              <br />
              One honest number.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIMENSIONS.map((dim) => (
              <div key={dim.name} className="glass rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-black text-base text-white uppercase">{dim.name}</h3>
                  <span className="text-xs font-ui text-lime bg-lime/10 px-2 py-1 rounded">{dim.weight}</span>
                </div>
                <p className="text-sm text-white/60 font-body leading-relaxed">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="section-pad bg-asphalt">
        <div className="container max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
                After your assessment
              </p>
              <h2 className="font-heading font-black text-section text-white uppercase mb-8">
                Your score is the
                <br />
                <span className="text-lime">starting point.</span>
              </h2>
              <div className="space-y-5">
                {[
                  "Your total Steer Score (0–100) and what it means",
                  "Breakdown across all 6 dimensions — where you're strong, where to improve",
                  "Context: where your score sits in national averages",
                  "Specific recommended program based on your score and gap areas",
                  "A 15-minute debrief with your instructor",
                  "Full PDF report — yours to keep",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                    <p className="text-white/70 font-body">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-steel text-xs font-ui uppercase tracking-widest mb-3">Example score</p>
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  <circle cx="70" cy="70" r="60" fill="none" stroke="#2B2B2B" strokeWidth="12" />
                  <circle
                    cx="70" cy="70" r="60"
                    fill="none"
                    stroke="#D7FF2F"
                    strokeWidth="12"
                    strokeDasharray="377"
                    strokeDashoffset="133"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-heading font-black text-4xl text-white">65</span>
                  <span className="text-xs text-steel font-ui">/ 100</span>
                </div>
              </div>
              <p className="font-heading font-black text-sm text-white uppercase mb-2">
                Competent — Room to Earn More
              </p>
              <p className="text-xs text-steel font-ui mb-6">
                Stronger in city navigation, gaps in highway and all-conditions
              </p>
              <div className="space-y-2 mb-6">
                {[
                  { label: "Vehicle Control", score: 72 },
                  { label: "Hazard Perception", score: 68 },
                  { label: "City Navigation", score: 75 },
                  { label: "Highway Driving", score: 51 },
                  { label: "All Conditions", score: 48 },
                  { label: "Defensive Driving", score: 62 },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="text-xs text-steel font-ui w-28 text-left flex-shrink-0">{d.label}</span>
                    <div className="flex-1 bg-graphite rounded-full h-1.5">
                      <div
                        className="h-full rounded-full bg-lime"
                        style={{ width: `${d.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-ui text-white/60 w-6 text-right">{d.score}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/score/book"
                className="block w-full bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-3 hover:bg-lime/90 transition-colors"
              >
                Book Your Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-lgrey">
        <div className="container max-w-[1440px] max-w-3xl mx-auto">
          <h2 className="font-heading font-black text-2xl text-white uppercase mb-10 text-center">
            Common Questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-white/10 pb-6">
                <h3 className="font-heading font-black text-white text-sm uppercase tracking-wide mb-2">
                  {item.q}
                </h3>
                <p className="text-white/60 font-body text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-asphalt border-t border-white/8">
        <div className="container max-w-[1440px] text-center">
          <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
            Find out where you actually stand.
          </h2>
          <p className="text-white/50 font-body mb-8">30 minutes. A certified instructor. The honest answer.</p>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-10 py-4 hover:bg-lime/90 transition-all hover:scale-[1.02]"
          >
            Book Your Steer Score — ₹299
          </Link>
        </div>
      </section>
    </div>
  );
}
