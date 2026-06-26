import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Users, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Events — City Drives, Workshops, Road Trips, Track Days",
  description:
    "Monthly city drives, skill workshops, weekend road trips, and track days. SteerClub events are the reason members don't cancel — community that meets on real roads.",
};

const UPCOMING_EVENTS = [
  {
    slug: "chandigarh-city-drive-july",
    title: "Chandigarh City Drive",
    type: "city-drive" as const,
    city: "Chandigarh",
    date: "July 13, 2026",
    time: "7:00 AM",
    location: "Sector 17, Chandigarh",
    capacity: 12,
    registered: 7,
    memberOnly: true,
    price: 0,
    description: "8 cars. A curated route through the city at dawn. Brunch at the end.",
  },
  {
    slug: "delhi-night-driving-workshop",
    title: "Night Driving Workshop — Delhi",
    type: "workshop" as const,
    city: "Delhi NCR",
    date: "July 19, 2026",
    time: "8:30 PM",
    location: "Siri Fort, South Delhi",
    capacity: 10,
    registered: 9,
    memberOnly: true,
    price: 0,
    description: "Night conditions, low visibility. What you need to know about driving after dark.",
  },
  {
    slug: "spiti-road-trip-sept",
    title: "Spiti Valley Road Trip",
    type: "road-trip" as const,
    city: "All Cities",
    date: "September 5–8, 2026",
    time: "Departs 6:00 AM Sep 5",
    location: "Chandigarh → Spiti Valley",
    capacity: 16,
    registered: 11,
    memberOnly: true,
    price: 1499900,
    description: "4 days. Mountain briefing. Night protocols. The road you've been waiting to be ready for.",
  },
  {
    slug: "bangalore-track-day-aug",
    title: "Track Day — Bangalore (Pro/Select)",
    type: "track-day" as const,
    city: "Bangalore",
    date: "August 3, 2026",
    time: "9:00 AM",
    location: "Kari Motor Speedway, Chettipalya",
    capacity: 14,
    registered: 6,
    memberOnly: true,
    price: 299900,
    description: "Controlled track environment. Advanced car control. Pro and Select members only.",
  },
];

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  "city-drive": { label: "City Drive", color: "text-lime bg-lime/10" },
  "workshop": { label: "Workshop", color: "text-blue-400 bg-blue-400/10" },
  "road-trip": { label: "Road Trip", color: "text-orange-400 bg-orange-400/10" },
  "track-day": { label: "Track Day", color: "text-purple-400 bg-purple-400/10" },
};

export default function EventsPage() {
  return (
    <div className="pt-24 bg-asphalt">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Events
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              The community lives
              <br />
              <span className="text-lime">on real roads.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              Monthly city drives. Skill workshops. Weekend road trips. Track days.
              Each event is designed to be the story you tell on Monday morning.
              Most events are included in membership — no extra charge.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-3 mb-10">
            {[
              { label: "All Events", value: "" },
              { label: "City Drives", value: "city-drive" },
              { label: "Workshops", value: "workshop" },
              { label: "Road Trips", value: "road-trip" },
              { label: "Track Days", value: "track-day" },
            ].map((tab) => (
              <Link
                key={tab.value}
                href={tab.value ? `/events?type=${tab.value}` : "/events"}
                className="text-xs font-heading font-black uppercase tracking-wide px-4 py-2 border border-white/20 text-white/60 hover:border-white/50 hover:text-white transition-all"
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Events list */}
          <div className="space-y-5">
            {UPCOMING_EVENTS.map((event) => {
              const typeInfo = EVENT_TYPE_LABELS[event.type] ?? { label: event.type, color: "text-white/60 bg-white/10" };
              const spotsLeft = event.capacity - event.registered;
              return (
                <div key={event.slug} className="glass rounded-xl p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`text-xs font-ui uppercase tracking-widest px-3 py-1 rounded ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {event.memberOnly && (
                          <span className="flex items-center gap-1 text-xs font-ui text-steel">
                            <Lock className="w-3 h-3" /> Members only
                          </span>
                        )}
                        {spotsLeft <= 3 && (
                          <span className="text-xs font-ui text-red-400 bg-red-400/10 px-2 py-1 rounded">
                            {spotsLeft} spots left
                          </span>
                        )}
                      </div>

                      <h2 className="font-heading font-black text-2xl text-white uppercase mb-2">
                        {event.title}
                      </h2>
                      <p className="text-white/60 font-body text-sm leading-relaxed mb-4 max-w-xl">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-5">
                        <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                          <Calendar className="w-3.5 h-3.5" />
                          {event.date} · {event.time}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                          <Users className="w-3.5 h-3.5" />
                          {event.registered}/{event.capacity} registered
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="font-heading font-black text-xl text-white">
                        {event.price === 0
                          ? "Free for Members"
                          : `₹${(event.price / 100).toLocaleString("en-IN")}`}
                      </p>
                      {event.memberOnly ? (
                        <Link
                          href="/membership"
                          className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-all"
                        >
                          Join to Attend
                        </Link>
                      ) : (
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-all"
                        >
                          RSVP →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Not a member CTA */}
          <div className="mt-16 rounded-2xl border border-white/10 p-10 text-center">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
              Events are a member benefit
            </p>
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Most events are free for members.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
              City drives, workshops, and more — included in your Steer Member subscription.
              Road trips and track days at deeply discounted member rates.
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
            >
              See Membership Plans →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
