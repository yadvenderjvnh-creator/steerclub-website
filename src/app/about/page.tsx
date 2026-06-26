import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story — SteerClub",
  description:
    "Coaching came first. SteerClub is what happens when you take that seriously. The story of how India's first Driving Confidence platform started.",
};

export default function AboutPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[1440px] section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Founder narrative */}
          <div>
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-6">
              Our Story
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-8">
              Coaching came first.
              <br />
              <span className="text-lime">SteerClub is what happens when you take that seriously.</span>
            </h1>

            <div className="prose-sc space-y-6">
              <p>
                India licenses ten million new drivers every year.
                Almost none of them are taught to drive.
              </p>
              <p>
                The test proves you can start a car and move it forward without immediate catastrophe.
                It says nothing about what you do when a truck cuts you off on a mountain pass at night.
                It says nothing about the roundabout in peak-hour Bangalore. It says nothing about the
                moment the road gets wet, the light gets bad, and everything you think you know gets tested.
              </p>
              <p>
                We are a country of licensed drivers who quietly know — behind the confidence we perform
                for others — that we are not as capable as we should be.
              </p>
              <p>
                That quiet knowledge is the gap SteerClub was built to close.
              </p>
              <p>
                Not because bad driving is dangerous. Not because of statistics or campaigns or fear.
              </p>
              <p className="text-white font-body text-lg">
                But because the moment you become genuinely capable behind the wheel — the moment your
                Steer Score reflects something you actually earned — is the moment the road stops being
                something that happens to you and starts being something you command.
              </p>
              <p>
                SteerClub exists for the driver who wants to get there.
                Not just arrive there. <em>Get there.</em>
              </p>
            </div>

            <div className="mt-12">
              <p className="font-heading font-black text-white text-xl mb-1">Yadvender Narang</p>
              <p className="text-steel font-ui text-sm">Founder, SteerClub (Steer Co.)</p>
              <p className="text-steel font-ui text-sm">Zirakpur, Punjab</p>
            </div>
          </div>

          {/* Brand values */}
          <div className="space-y-6">
            {/* Mission */}
            <div className="glass rounded-2xl p-7">
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-3">Mission</p>
              <p className="font-heading font-black text-xl text-white uppercase leading-snug">
                To make every Indian a genuinely capable driver.
              </p>
            </div>

            {/* Vision */}
            <div className="glass rounded-2xl p-7">
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-3">Vision</p>
              <p className="font-heading font-black text-xl text-white uppercase leading-snug">
                A country where the license is where driving begins,
                not where it ends.
              </p>
            </div>

            {/* Brand promise */}
            <div className="bg-lime rounded-2xl p-7">
              <p className="text-xs font-heading font-black uppercase tracking-widest text-asphalt/60 mb-3">
                Our Promise
              </p>
              <p className="font-heading font-black text-2xl text-asphalt uppercase leading-snug">
                Genuine capability,
                proven by a score
                that doesn't lie.
              </p>
            </div>

            {/* What SteerClub is not */}
            <div className="glass rounded-2xl p-7">
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-5">
                What SteerClub is / is not
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-lime font-heading font-black uppercase tracking-wide mb-2">Is</p>
                  {["A community of capable drivers", "A standard of earned competence", "An identity you grow into", "Precision with warmth"].map(item => (
                    <p key={item} className="text-xs text-white/70 font-ui mb-1.5">{item}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-steel font-heading font-black uppercase tracking-wide mb-2">Is Not</p>
                  {["A driving school", "A road safety campaign", "A service you consume", "Corporate or clinical"].map(item => (
                    <p key={item} className="text-xs text-white/40 font-ui mb-1.5 line-through">{item}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/score/book"
                className="flex-1 text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
              >
                Take Your Score
              </Link>
              <Link
                href="/instructors"
                className="flex-1 text-center border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase py-4 hover:border-white/50 transition-colors"
              >
                Our Instructors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
