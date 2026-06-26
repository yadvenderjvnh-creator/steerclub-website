import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Score Wall — Earned, Publicly",
  description:
    "Real SteerClub members. Real score improvements. Driving capability, earned and shown with pride on the SteerClub Score Wall.",
};

type WallEntry = {
  name: string;
  city: string;
  before: number;
  after: number;
  program: string;
  quote: string;
};

const WALL: WallEntry[] = [
  { name: "Priya Mehta", city: "Chandigarh", before: 44, after: 79, program: "City Mastery™", quote: "Got back something I didn't know I'd lost." },
  { name: "Arjun Sharma", city: "Delhi", before: 61, after: 83, program: "Highway Freedom™", quote: "Best driving I've done in fifteen years." },
  { name: "Kavya Iyer", city: "Bangalore", before: 38, after: 67, program: "Confidence Foundation™", quote: "Eight of us, all starting together." },
  { name: "Rohan Kapoor", city: "Mumbai", before: 52, after: 81, program: "All Conditions™", quote: "Rain doesn't scare me anymore." },
  { name: "Sneha Reddy", city: "Bangalore", before: 49, after: 74, program: "City Mastery™", quote: "Parallel parking on the first try, finally." },
  { name: "Vikram Singh", city: "Chandigarh", before: 58, after: 88, program: "Roadtrip Ready™", quote: "Did Spiti. Solo. Earned every kilometre." },
  { name: "Ananya Das", city: "Delhi", before: 41, after: 70, program: "Confidence Foundation™", quote: "The car doesn't sit in the driveway anymore." },
  { name: "Karan Malhotra", city: "Mumbai", before: 64, after: 86, program: "Highway Freedom™", quote: "Merging at speed feels natural now." },
  { name: "Ishita Roy", city: "Bangalore", before: 47, after: 76, program: "All Conditions™", quote: "Night driving used to terrify me." },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-lime";
  if (score >= 60) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-orange-400";
}

export default function ScoreWallPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          <Link
            href="/community"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← Community
          </Link>

          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              The Score Wall
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              Earned. <span className="text-lime">Publicly.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              No participation trophies. No before-you-tried badges. Just real members who put in
              the work, re-took the assessment, and earned a number they&apos;re proud to show. This
              is what earned looks like.
            </p>
          </div>

          {/* Wall grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
            {WALL.map((entry) => (
              <div
                key={entry.name}
                className="glass rounded-xl p-6 hover:border-lime/20 border border-transparent transition-all"
              >
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-heading font-black text-2xl text-steel">{entry.before}</span>
                  <span className="text-steel">→</span>
                  <span className={`font-heading font-black text-4xl ${scoreColor(entry.after)}`}>
                    {entry.after}
                  </span>
                  <span className="text-xs font-ui text-lime ml-auto">
                    +{entry.after - entry.before}
                  </span>
                </div>
                <p className="text-white/70 font-body italic mb-4">&ldquo;{entry.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="font-heading font-black text-sm text-white uppercase">
                      {entry.name}
                    </p>
                    <p className="text-xs text-steel font-ui">{entry.city}</p>
                  </div>
                  <span className="text-xs font-ui text-lime/70">{entry.program}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Join CTA */}
          <div className="rounded-2xl border border-lime/20 p-10 text-center">
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Your number belongs here too.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
              It starts with one honest score and one program. The wall is waiting.
            </p>
            <Link
              href="/score/book"
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
            >
              Take Your Score — ₹299
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
