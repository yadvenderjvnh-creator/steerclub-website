import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How the Steer Score Works — SteerClub",
  description:
    "The Steer Score is not a driving test. It's a 30-minute in-vehicle assessment that measures 6 real-world driving dimensions. Here's exactly how it works.",
};

export default function HowItWorksPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[1440px] section-pad">
        <div className="max-w-3xl mx-auto">
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
            How It Works
          </p>
          <h1 className="font-heading font-black text-section text-white uppercase mb-8">
            A driving test checks if you
            <br />
            can follow rules.
            <br />
            <span className="text-lime">The Steer Score measures if
            <br />
            you can handle reality.</span>
          </h1>

          {/* Steps */}
          <div className="space-y-10 mb-16">
            {[
              {
                step: "01",
                title: "Book Your Assessment",
                desc: "Choose your city, preferred date, and complete the booking. ₹299, paid online. We confirm your instructor and session details within 2 hours via WhatsApp.",
              },
              {
                step: "02",
                title: "The 30-Minute Drive",
                desc: "Your certified instructor rides with you. No preparation needed — drive exactly as you normally drive. The assessment protocol is standardised: specific road types, scenarios, and conditions that test all six dimensions fairly.",
              },
              {
                step: "03",
                title: "Score Calculation",
                desc: "Your instructor scores each dimension immediately after the session using our proprietary rubric. Total Steer Score calculated and contextualised against the national database.",
              },
              {
                step: "04",
                title: "Your Score Reveal",
                desc: "15-minute debrief with your instructor. Score presented dimension-by-dimension. Where you're strong. Where the gaps are. Why they matter. What to do about them — specifically.",
              },
              {
                step: "05",
                title: "Your Recommended Path",
                desc: "The score is not the end. It's the beginning. Your instructor recommends the specific program (or confirms you're ready for advanced levels). Your full PDF report follows by email.",
              },
            ].map((item) => (
              <div key={item.step} className="grid grid-cols-[40px_1fr] gap-6 items-start">
                <div className="font-heading font-black text-lime text-sm">{item.step}</div>
                <div>
                  <h3 className="font-heading font-black text-white uppercase text-lg mb-2">{item.title}</h3>
                  <p className="text-white/60 font-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* The difference */}
          <div className="glass rounded-2xl p-8 mb-12">
            <h2 className="font-heading font-black text-xl text-white uppercase mb-6">
              How it differs from the RTO test
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-ui uppercase tracking-widest text-steel mb-3">RTO Test</p>
                <div className="space-y-2">
                  {[
                    "Tests rule knowledge",
                    "5–10 minute assessment",
                    "Pass/fail only",
                    "Static parking lot route",
                    "No real conditions",
                    "No feedback or report",
                  ].map(item => (
                    <p key={item} className="text-xs text-white/40 font-ui flex items-start gap-2">
                      <span className="text-steel mt-0.5">×</span> {item}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-ui uppercase tracking-widest text-lime mb-3">Steer Score</p>
                <div className="space-y-2">
                  {[
                    "Tests real driving capability",
                    "30-minute in-vehicle assessment",
                    "0–100 scale, 6 dimensions",
                    "Real city and road conditions",
                    "All-conditions protocol",
                    "Full report + recommended path",
                  ].map(item => (
                    <p key={item} className="text-xs text-white/70 font-ui flex items-start gap-2">
                      <span className="text-lime mt-0.5">✓</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/score/book"
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase px-10 py-5 hover:bg-lime/90 transition-all hover:scale-[1.02]"
            >
              Book Your Assessment — ₹299
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
