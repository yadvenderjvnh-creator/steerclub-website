import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, MapPin, Trophy } from "lucide-react";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

type Chapter = {
  city: string;
  name: string;
  cityLabel: string;
  members: number;
  captain: string;
  rhythm: string;
  active: boolean;
  blurb: string;
  upcoming: { title: string; date: string; type: string }[];
};

const CHAPTERS: Record<string, Chapter> = {
  chandigarh: {
    city: "chandigarh",
    name: "Chandigarh Chapter",
    cityLabel: "Chandigarh / Zirakpur",
    members: 120,
    captain: "Yadvender Narang",
    rhythm: "Monthly city drive · Skill workshop · Quarterly highway run",
    active: true,
    blurb:
      "Where SteerClub started. The Chandigarh chapter set the standard every other chapter follows — a real community of drivers who took their driving seriously and got better together.",
    upcoming: [
      { title: "Sunday City Drive — Sukhna to Kasauli", date: "July 13", type: "City Drive" },
      { title: "Parking & Tight-Spaces Workshop", date: "July 27", type: "Workshop" },
      { title: "Highway Discipline Run — Chandigarh to Shimla", date: "August 10", type: "Highway Run" },
    ],
  },
  delhi: {
    city: "delhi",
    name: "Delhi NCR Chapter",
    cityLabel: "Delhi NCR",
    members: 340,
    captain: "Chapter Captain — TBA",
    rhythm: "Bi-weekly meets · Night driving workshops · Monthly long drive",
    active: true,
    blurb:
      "The largest SteerClub chapter. Delhi NCR drivers face the toughest, most unforgiving traffic in India — and they train for it together.",
    upcoming: [
      { title: "Night Driving Workshop — Ring Road", date: "July 19", type: "Workshop" },
      { title: "NCR Long Drive — Delhi to Neemrana", date: "August 2", type: "City Drive" },
      { title: "Merging & Flyovers Masterclass", date: "August 16", type: "Workshop" },
    ],
  },
  bangalore: {
    city: "bangalore",
    name: "Bangalore Chapter",
    cityLabel: "Bangalore",
    members: 280,
    captain: "Chapter Captain — TBA",
    rhythm: "Monthly track day · Weekend drives · Rain-driving sessions",
    active: true,
    blurb:
      "Bangalore's chapter is built around the city's notorious traffic and unpredictable rain. If you can drive here, you can drive anywhere.",
    upcoming: [
      { title: "Track Day — Kari Motor Speedway", date: "August 3", type: "Track Day" },
      { title: "Monsoon Driving Clinic", date: "July 21", type: "Workshop" },
      { title: "Nandi Hills Sunrise Drive", date: "August 17", type: "City Drive" },
    ],
  },
  mumbai: {
    city: "mumbai",
    name: "Mumbai Chapter",
    cityLabel: "Mumbai",
    members: 195,
    captain: "Chapter Captain — TBA",
    rhythm: "Monthly coastal drive · Tight-parking clinics · Sea Link runs",
    active: true,
    blurb:
      "Mumbai drivers master the narrowest lanes and the tightest parking in the country. The chapter turns that daily grind into genuine skill.",
    upcoming: [
      { title: "Coastal Road City Drive", date: "July 20", type: "City Drive" },
      { title: "Tight Parking Masterclass — Bandra", date: "August 4", type: "Workshop" },
      { title: "Sea Link Confidence Run", date: "August 18", type: "City Drive" },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(CHAPTERS).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const chapter = CHAPTERS[city];
  if (!chapter) return {};
  return {
    title: `${chapter.name} — SteerClub Community`,
    description: `Join ${chapter.members}+ drivers in the SteerClub ${chapter.cityLabel} chapter. ${chapter.rhythm}.`,
  };
}

export default async function CityChapterPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const chapter = CHAPTERS[city];
  if (!chapter) notFound();

  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Breadcrumb */}
          <Link
            href="/community"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← All Chapters
          </Link>

          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-lime" />
                <span className="text-xs font-ui uppercase tracking-widest text-lime">
                  Active Chapter
                </span>
              </div>
              <h1 className="font-heading font-black text-section text-white uppercase mb-6">
                {chapter.name}
              </h1>
              <p className="text-white/60 font-body text-lg leading-relaxed mb-8">
                {chapter.blurb}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-5">
                  <Users className="w-5 h-5 text-lime mb-3" />
                  <p className="font-heading font-black text-2xl text-white">{chapter.members}+</p>
                  <p className="text-xs text-steel font-ui uppercase tracking-wide">Members</p>
                </div>
                <div className="glass rounded-xl p-5">
                  <Trophy className="w-5 h-5 text-lime mb-3" />
                  <p className="font-heading font-black text-2xl text-white">
                    {chapter.upcoming.length}
                  </p>
                  <p className="text-xs text-steel font-ui uppercase tracking-wide">
                    Upcoming events
                  </p>
                </div>
              </div>
            </div>

            {/* Captain + rhythm card */}
            <div className="glass rounded-2xl p-8">
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">
                Chapter Captain
              </p>
              <p className="font-heading font-black text-xl text-white mb-6">{chapter.captain}</p>
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">
                The Monthly Rhythm
              </p>
              <p className="text-white/70 font-body mb-8">{chapter.rhythm}</p>
              <a
                href={buildWhatsAppLink(WA_MESSAGES.generalEnquiry())}
                className="block w-full text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors mb-3"
              >
                Join This Chapter
              </a>
              <Link
                href="/membership"
                className="block w-full text-center border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase py-4 hover:border-lime/50 hover:text-lime transition-all"
              >
                See Membership
              </Link>
            </div>
          </div>

          {/* Upcoming events */}
          <div className="mb-16">
            <h2 className="font-heading font-black text-2xl text-white uppercase mb-8">
              Upcoming in {chapter.cityLabel}
            </h2>
            <div className="space-y-4">
              {chapter.upcoming.map((event) => (
                <div
                  key={event.title}
                  className="glass rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-lime/20 border border-transparent transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-lime/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-lime" />
                    </div>
                    <div>
                      <span className="text-xs font-ui uppercase tracking-widest text-lime">
                        {event.type}
                      </span>
                      <p className="font-heading font-black text-white mt-1">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-steel font-ui mt-1">
                        <MapPin className="w-3 h-3" />
                        {chapter.cityLabel} · {event.date}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/events"
                    className="text-lime font-heading font-black text-xs uppercase tracking-wide whitespace-nowrap hover:translate-x-1 transition-transform inline-block"
                  >
                    RSVP →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Not a member CTA */}
          <div className="rounded-2xl border border-lime/20 p-10 text-center">
            <h2 className="font-heading font-black text-2xl text-white uppercase mb-4">
              Chapter events are for members.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
              Every member started with an honest Steer Score. Find out where you stand, then join
              your city.
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
