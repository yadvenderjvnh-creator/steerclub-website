import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, announcements, galleryPhotos } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { CommunityManager, type EventRow, type AnnouncementRow, type PhotoRow } from "./community-manager";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireRole(["admin"]);

  const [eventRows, annRows, photoRows] = await Promise.all([
    db
      .select({
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
        isPublished: events.isPublished,
        registered: sql<number>`(select count(*) from event_registrations er where er.event_id = ${events.id} and er.status = 'confirmed')::int`,
      })
      .from(events)
      .orderBy(desc(events.eventDate)),
    db.select().from(announcements).orderBy(desc(announcements.createdAt)),
    db
      .select({
        id: galleryPhotos.id,
        imageUrl: galleryPhotos.imageUrl,
        caption: galleryPhotos.caption,
        city: galleryPhotos.city,
        approved: galleryPhotos.approved,
        createdAt: galleryPhotos.createdAt,
      })
      .from(galleryPhotos)
      .orderBy(desc(galleryPhotos.createdAt)),
  ]);

  const eventData: EventRow[] = eventRows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    type: e.type,
    city: e.city,
    eventDate: e.eventDate.toISOString(),
    location: e.location,
    locationUrl: e.locationUrl,
    capacity: e.capacity,
    memberOnly: e.memberOnly,
    price: e.price ?? 0,
    imageUrl: e.imageUrl,
    isPublished: e.isPublished,
    registered: e.registered,
  }));

  const annData: AnnouncementRow[] = annRows.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    audience: a.audience,
    city: a.city,
    isPublished: a.isPublished,
  }));

  const photoData: PhotoRow[] = photoRows.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    caption: p.caption,
    city: p.city,
    approved: p.approved,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Community</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Events, Announcements & Gallery</h1>
        <p className="text-steel text-sm font-ui mt-1">
          Create city drives, workshops and road trips, broadcast announcements, and curate the photo wall.
        </p>
      </div>
      <CommunityManager events={eventData} announcements={annData} photos={photoData} />
    </div>
  );
}
