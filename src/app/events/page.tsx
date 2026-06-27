import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Users, Lock } from "lucide-react";
import { getPublishedEvents } from "@/lib/community/queries";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events — City Drives, Workshops, Road Trips, Track Days",
  description:
    "Monthly city drives, skill workshops, weekend road trips, and track days. SteerClub events are the reason members don't cancel — community that meets on real roads.",
};

export const dynamic = "force-dynamic";

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  "city-drive": { label: "City Drive", color: "text-lime bg-lime/10" },
  "workshop": { label: "Workshop", color: "text-blue-400 bg-blue-400/10" },
  "road-trip": { label: "Road Trip", color: "text-orange-400 bg-orange-400/10" },
  "track-day": { label: "Track Day", color: "text-purple-400 bg-purple-400/10" },
  "steerFest": { label: "SteerFest", color: "text-pink-400 bg-pink-400/10" },
};

export default async function EventsPage() {
  const events = await getPublishedEvents();

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

          {/* Events list */}
          {events.length === 0 ? (
            <div className="rounded-2xl border border-white/10 p-12 text-center">
              <h2 className="font-heading font-black text-2xl text-white uppercase mb-3">No events on the calendar yet</h2>
              <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
                New drives and workshops drop every month. Become a member to get first access when they go live.
              </p>
              <Link href="/membership" className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all">
                See Membership Plans →
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {events.map((event) => {
                const typeInfo = EVENT_TYPE_LABELS[event.type] ?? { label: event.type, color: "text-white/60 bg-white/10" };
                const spotsLeft = event.capacity - event.registered;
                const full = spotsLeft <= 0;
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
                          {!full && spotsLeft <= 3 && (
                            <span className="text-xs font-ui text-red-400 bg-red-400/10 px-2 py-1 rounded">
                              {spotsLeft} spots left
                            </span>
                          )}
                          {full && (
                            <span className="text-xs font-ui text-red-400 bg-red-400/10 px-2 py-1 rounded">Full</span>
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
                            {new Date(event.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location} · <span className="capitalize">{event.city}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                            <Users className="w-3.5 h-3.5" />
                            {event.registered}/{event.capacity} registered
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <p className="font-heading font-black text-xl text-white">
                          {(event.price ?? 0) === 0 ? "Free for Members" : formatINR(event.price ?? 0)}
                        </p>
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-all"
                        >
                          {full ? "View Event" : "RSVP →"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
