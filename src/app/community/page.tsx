import type { Metadata } from "next";
import Link from "next/link";
import { Users, MapPin, Calendar } from "lucide-react";
import { getCityChapters } from "@/lib/community/queries";

export const metadata: Metadata = {
  title: "Community — City Chapters Across India",
  description:
    "SteerClub community chapters in Chandigarh, Delhi, Bangalore, Mumbai and more. Monthly city drives, skill workshops, and a private members club for drivers who take their driving seriously.",
};

export const dynamic = "force-dynamic";

const CITY_CHAPTERS = [
  {
    city: "chandigarh",
    name: "Chandigarh Chapter",
    members: 120,
    captain: "Yadvender Narang",
    nextEvent: "City Drive — July 13",
    events: 4,
    active: true,
  },
  {
    city: "delhi",
    name: "Delhi NCR Chapter",
    members: 340,
    captain: "Coming soon",
    nextEvent: "Night Driving Workshop — July 19",
    events: 6,
    active: true,
  },
  {
    city: "bangalore",
    name: "Bangalore Chapter",
    members: 280,
    captain: "Coming soon",
    nextEvent: "Track Day — August 3",
    events: 5,
    active: true,
  },
  {
    city: "mumbai",
    name: "Mumbai Chapter",
    members: 195,
    captain: "Coming soon",
    nextEvent: "City Drive — July 20",
    events: 4,
    active: true,
  },
  {
    city: "hyderabad",
    name: "Hyderabad Chapter",
    members: 0,
    captain: null,
    nextEvent: null,
    events: 0,
    active: false,
  },
  {
    city: "pune",
    name: "Pune Chapter",
    members: 0,
    captain: null,
    nextEvent: null,
    events: 0,
    active: false,
  },
];

export default async function CommunityPage() {
  // Live per-city aggregates (upcoming events + next event) overlaid on editorial copy.
  const stats = await getCityChapters();
  const statByCity = new Map(stats.map((s) => [s.city, s]));
  const chapters = CITY_CHAPTERS.map((c) => {
    const s = statByCity.get(c.city);
    const nextEvent = s?.nextEventTitle
      ? `${s.nextEventTitle} — ${s.nextEventDate ? new Date(s.nextEventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}`.trim()
      : c.nextEvent;
    return {
      ...c,
      events: s ? s.upcomingCount : c.events,
      nextEvent,
      active: c.active || (s ? s.upcomingCount > 0 : false),
    };
  });

  return (
    <div className="pt-24 bg-asphalt">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Community
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              The road is more interesting
              <br />
              <span className="text-lime">with the right people.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              A SteerClub chapter is not a WhatsApp group. It's a real community —
              people who've driven together, improved together, and built something together.
              Each chapter has a Captain, a monthly rhythm, and a shared standard.
            </p>
          </div>

          {/* City chapters */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
            {chapters.map((chapter) => (
              <div key={chapter.city}>
                {chapter.active ? (
                  <Link
                    href={`/community/${chapter.city}`}
                    className="group block glass rounded-xl p-6 hover-lift hover:border-lime/20 border border-transparent transition-all duration-300 h-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="font-heading font-black text-lg text-white uppercase group-hover:text-lime transition-colors">
                        {chapter.name}
                      </h2>
                      <span className="w-2 h-2 rounded-full bg-lime flex-shrink-0 mt-1.5" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-steel font-ui">
                        <Users className="w-3.5 h-3.5" />
                        {chapter.members}+ members
                      </div>
                      {chapter.nextEvent && (
                        <div className="flex items-center gap-2 text-xs text-steel font-ui">
                          <Calendar className="w-3.5 h-3.5" />
                          {chapter.nextEvent}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-steel font-ui">
                        <MapPin className="w-3.5 h-3.5" />
                        {chapter.events} events this quarter
                      </div>
                    </div>
                    <p className="mt-4 text-lime font-heading font-black text-xs uppercase tracking-wide group-hover:translate-x-1 transition-transform inline-block">
                      Explore Chapter →
                    </p>
                  </Link>
                ) : (
                  <div className="block glass rounded-xl p-6 h-full border border-white/5 opacity-50">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="font-heading font-black text-lg text-white uppercase">
                        {chapter.name}
                      </h2>
                      <span className="w-2 h-2 rounded-full bg-steel flex-shrink-0 mt-1.5" />
                    </div>
                    <p className="text-xs text-steel font-ui mb-4">Coming soon</p>
                    <Link
                      href="/community/waitlist"
                      className="text-xs font-ui text-white/40 hover:text-lime transition-colors"
                    >
                      Join waitlist →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Community beliefs */}
          <div className="bg-lgrey rounded-2xl p-10 md:p-16 mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-8">
              What we believe
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Driving is a skill. Not a right.",
                "The license was just the beginning.",
                "The road rewards the prepared.",
                "Capability is earned, not assumed.",
                "Independence is a capability, not a privilege.",
                "Everyone here had to earn their place.",
              ].map((belief) => (
                <div key={belief} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0 mt-2" />
                  <p className="font-heading font-black text-base text-white uppercase">{belief}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score wall teaser */}
          <div className="text-center mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              The Score Wall
            </p>
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Scores earned. Publicly.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-xl mx-auto">
              Members who choose to share their score improvement — publicly, with pride.
              This is what earned looks like.
            </p>
            <Link
              href="/community/wall"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:border-lime/50 hover:text-lime transition-all"
            >
              View the Score Wall →
            </Link>
          </div>

          {/* Join CTA */}
          <div className="rounded-2xl border border-lime/20 p-10 text-center">
            <p className="font-heading font-black text-xs tracking-[0.25em] uppercase text-lime mb-4">
              Join the Community
            </p>
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Start with your Steer Score.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
              Every SteerClub member starts the same way: with an honest number and a clear next step.
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
