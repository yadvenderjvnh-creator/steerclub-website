import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, galleryPhotos, users } from "@/lib/db/schema";

const confirmedCount = sql<number>`(select count(*) from event_registrations er where er.event_id = ${events.id} and er.status = 'confirmed')::int`;

const eventCols = {
  id: events.id,
  slug: events.slug,
  title: events.title,
  description: events.description,
  type: events.type,
  city: events.city,
  eventDate: events.eventDate,
  location: events.location,
  locationUrl: events.locationUrl,
  capacity: events.capacity,
  memberOnly: events.memberOnly,
  price: events.price,
  imageUrl: events.imageUrl,
  registered: confirmedCount,
};

/** All published, upcoming events (soonest first). Public — no auth. */
export async function getPublishedEvents() {
  return db
    .select(eventCols)
    .from(events)
    .where(and(eq(events.isPublished, true), sql`${events.eventDate} >= now()`))
    .orderBy(asc(events.eventDate))
    .limit(50);
}

/** A single published event by slug (or null). Public — no auth. */
export async function getEventBySlug(slug: string) {
  const [row] = await db
    .select(eventCols)
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublished, true)))
    .limit(1);
  return row ?? null;
}

export type CityChapterStat = {
  city: string;
  upcomingCount: number;
  memberCount: number;
  nextEventTitle: string | null;
  nextEventDate: Date | null;
};

/** Per-city live aggregates for the community/chapter pages. */
export async function getCityChapters(): Promise<CityChapterStat[]> {
  const [eventAgg, memberAgg] = await Promise.all([
    db
      .select({
        city: events.city,
        upcomingCount: sql<number>`count(*)::int`,
        nextEventDate: sql<Date>`min(${events.eventDate})`,
      })
      .from(events)
      .where(and(eq(events.isPublished, true), sql`${events.eventDate} >= now()`))
      .groupBy(events.city),
    db
      .select({ city: users.city, memberCount: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.city),
  ]);

  const memberByCity = new Map(memberAgg.map((m) => [m.city, m.memberCount]));
  // Resolve the next event title per city (cheap second pass).
  const nextTitles = new Map<string, string>();
  for (const e of eventAgg) {
    if (!e.city || !e.nextEventDate) continue;
    const [t] = await db
      .select({ title: events.title })
      .from(events)
      .where(and(eq(events.isPublished, true), eq(events.city, e.city), sql`${events.eventDate} = ${e.nextEventDate}`))
      .limit(1);
    if (t) nextTitles.set(e.city, t.title);
  }

  return eventAgg
    .filter((e) => e.city)
    .map((e) => ({
      city: e.city as string,
      upcomingCount: e.upcomingCount,
      memberCount: memberByCity.get(e.city) ?? 0,
      nextEventTitle: nextTitles.get(e.city as string) ?? null,
      nextEventDate: e.nextEventDate ?? null,
    }));
}

/** Approved gallery photos (public). */
export async function getPublicGallery(limit = 24) {
  return db
    .select({ id: galleryPhotos.id, imageUrl: galleryPhotos.imageUrl, caption: galleryPhotos.caption, city: galleryPhotos.city })
    .from(galleryPhotos)
    .where(eq(galleryPhotos.approved, true))
    .orderBy(desc(galleryPhotos.createdAt))
    .limit(limit);
}
