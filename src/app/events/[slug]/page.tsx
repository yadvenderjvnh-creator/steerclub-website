import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { Calendar, MapPin, Users, Lock } from "lucide-react";
import { getEventBySlug } from "@/lib/community/queries";
import { getSession } from "@/lib/auth/session";
import { isActiveMember, getProfile } from "@/lib/portal/queries";
import { db } from "@/lib/db";
import { eventRegistrations } from "@/lib/db/schema";
import { formatINR } from "@/lib/utils";
import { EventCTA } from "./event-cta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event — SteerClub" };
  return {
    title: `${event.title} — SteerClub Events`,
    description: event.description.slice(0, 155),
  };
}

const TYPE_LABELS: Record<string, string> = {
  "city-drive": "City Drive",
  workshop: "Workshop",
  "road-trip": "Road Trip",
  "track-day": "Track Day",
  steerFest: "SteerFest",
};

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const user = await getSession();
  let registered = false;
  let member = false;
  let phone: string | null = null;
  if (user) {
    member = await isActiveMember(user.id);
    const profile = await getProfile(user.id);
    phone = profile?.phone ?? null;
    const [r] = await db
      .select({ id: eventRegistrations.id })
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.userId, user.id),
          eq(eventRegistrations.eventId, event.id),
          eq(eventRegistrations.status, "confirmed")
        )
      )
      .limit(1);
    registered = Boolean(r);
  }

  const full = event.registered >= event.capacity;
  const price = event.price ?? 0;

  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <section className="section-pad">
        <div className="container max-w-[1100px]">
          <Link href="/events" className="text-steel hover:text-white font-ui text-xs uppercase tracking-widest">← All events</Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 mt-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
                  {TYPE_LABELS[event.type] ?? event.type}
                </span>
                {event.memberOnly && (
                  <span className="flex items-center gap-1 text-xs font-ui text-steel">
                    <Lock className="w-3 h-3" /> Members only
                  </span>
                )}
              </div>

              <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-5">
                {event.title}
              </h1>

              {event.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.imageUrl} alt={event.title} className="w-full rounded-xl mb-6 object-cover max-h-80" />
              )}

              <p className="text-white/70 font-body text-lg leading-relaxed whitespace-pre-line mb-8">
                {event.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Detail icon={Calendar} label="When" value={new Date(event.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />
                <Detail icon={MapPin} label="Where" value={`${event.location}`} sub={event.city} />
                <Detail icon={Users} label="Spots" value={`${event.registered}/${event.capacity}`} sub={full ? "Full" : `${event.capacity - event.registered} left`} />
              </div>

              {event.locationUrl && (
                <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-lime font-ui text-sm hover:underline">
                  Open map →
                </a>
              )}
            </div>

            {/* Sticky CTA card */}
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="glass rounded-2xl p-6">
                <p className="font-heading font-black text-3xl text-white mb-1">
                  {price === 0 ? "Free" : formatINR(price)}
                </p>
                <p className="text-steel text-xs font-ui mb-5">
                  {price === 0 ? (event.memberOnly ? "Included with membership" : "No charge") : "Per person"}
                </p>
                <EventCTA
                  slug={event.slug}
                  title={event.title}
                  price={price}
                  memberOnly={event.memberOnly}
                  full={full}
                  isLoggedIn={Boolean(user)}
                  isMember={member}
                  registered={registered}
                  user={user ? { name: user.name, email: user.email, phone } : null}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string | null }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-steel text-[10px] font-ui uppercase tracking-widest mb-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <p className="text-white font-ui text-sm">{value}</p>
      {sub && <p className="text-steel text-xs font-ui capitalize">{sub}</p>}
    </div>
  );
}
