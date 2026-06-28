"use server";

import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  events,
  eventRegistrations,
  announcements,
  galleryPhotos,
  activityLog,
  users,
  memberships,
  notifications,
} from "@/lib/db/schema";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendEmail } from "@/lib/email";

type City = "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai";
type EventType = "city-drive" | "workshop" | "road-trip" | "track-day" | "steerFest";
type Audience = "all" | "members" | "city" | "program";

async function log(actorId: string, action: string, entity: string, entityId: string, meta?: Record<string, unknown>) {
  await db.insert(activityLog).values({ actorId, action, entity, entityId, meta });
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

/** Notify city members when an event goes live (in-app for all eligible, email if opted in). Never throws. */
async function notifyEventPublished(eventId: string) {
  try {
    const [ev] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!ev || !ev.isPublished) return;

    const rows = await db
      .select({ id: users.id, email: users.email, name: users.name, commPrefs: users.commPrefs })
      .from(users)
      .where(eq(users.city, ev.city));

    let eligible = rows;
    if (ev.memberOnly) {
      const active = await db
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(eq(memberships.status, "active"));
      const memberIds = new Set(active.map((m) => m.userId));
      eligible = rows.filter((u) => memberIds.has(u.id));
    }

    const when = new Date(ev.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    for (const u of eligible) {
      await db.insert(notifications).values({
        userId: u.id,
        type: "event",
        title: `New event: ${ev.title}`,
        body: `${when} · ${ev.location}`,
        link: "/dashboard/community",
      });
      if (u.commPrefs?.email !== false) {
        await sendEmail({
          to: u.email,
          subject: `New SteerClub event — ${ev.title}`,
          html: `<p>Hi ${u.name},</p><p>A new event just dropped in ${ev.city}: <b>${ev.title}</b>.</p><p><b>When:</b> ${when}<br/><b>Where:</b> ${ev.location}</p><p><a href="https://steerclub.in/events/${ev.slug}">RSVP now →</a></p><p>— SteerClub</p>`,
        });
      }
    }
  } catch (err) {
    console.error("notifyEventPublished failed:", err);
  }
}

// ---------- Events ----------
export type EventInput = {
  id?: string;
  title: string;
  description: string;
  type: EventType;
  city: City;
  eventDate: string; // ISO / datetime-local
  location: string;
  locationUrl?: string | null;
  capacity: number;
  memberOnly: boolean;
  price: number; // paise
  imageUrl?: string | null;
  isPublished: boolean;
};

export async function upsertEvent(input: EventInput) {
  const admin = await requirePermission("community.write");
  const values = {
    title: input.title,
    description: input.description,
    type: input.type,
    city: input.city,
    eventDate: new Date(input.eventDate),
    location: input.location,
    locationUrl: input.locationUrl || null,
    capacity: Number(input.capacity),
    memberOnly: Boolean(input.memberOnly),
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    imageUrl: input.imageUrl || null,
    isPublished: Boolean(input.isPublished),
  };

  if (input.id) {
    await db.update(events).set(values).where(eq(events.id, input.id));
    await log(admin.id, "event.update", "event", input.id);
  } else {
    const slug = `${slugify(input.title)}-${randomBytes(3).toString("hex")}`;
    const [row] = await db.insert(events).values({ ...values, slug }).returning({ id: events.id });
    await log(admin.id, "event.create", "event", row.id, { slug });
    if (values.isPublished) await notifyEventPublished(row.id);
  }
  revalidatePath("/admin/community");
  revalidatePath("/events");
  revalidatePath("/community");
}

export async function togglePublishEvent(id: string, isPublished: boolean) {
  const admin = await requirePermission("community.write");
  await db.update(events).set({ isPublished }).where(eq(events.id, id));
  await log(admin.id, isPublished ? "event.publish" : "event.unpublish", "event", id);
  if (isPublished) await notifyEventPublished(id);
  revalidatePath("/admin/community");
  revalidatePath("/events");
  revalidatePath("/community");
}

export async function deleteEvent(id: string) {
  const admin = await requirePermission("community.write");
  await db.delete(events).where(eq(events.id, id)); // registrations cascade
  await log(admin.id, "event.delete", "event", id);
  revalidatePath("/admin/community");
  revalidatePath("/events");
}

export async function markEventAttendance(registrationId: string, attended: boolean) {
  const admin = await requirePermission("community.write");
  await db
    .update(eventRegistrations)
    .set({ attended, attendanceMarkedAt: new Date(), markedById: admin.id })
    .where(eq(eventRegistrations.id, registrationId));
  await log(admin.id, "event.attendance", "event_registration", registrationId, { attended });
  revalidatePath("/admin/community");
}

// ---------- Announcements ----------
export type AnnouncementInput = {
  id?: string;
  title: string;
  body: string;
  audience: Audience;
  city?: City | null;
  isPublished: boolean;
};

export async function upsertAnnouncement(input: AnnouncementInput) {
  const admin = await requirePermission("community.write");
  const values = {
    title: input.title,
    body: input.body,
    audience: input.audience,
    city: input.audience === "city" ? (input.city ?? null) : null,
    isPublished: Boolean(input.isPublished),
    publishedAt: input.isPublished ? new Date() : null,
    createdById: admin.id,
  };
  if (input.id) {
    await db.update(announcements).set(values).where(eq(announcements.id, input.id));
    await log(admin.id, "announcement.update", "announcement", input.id);
  } else {
    const [row] = await db.insert(announcements).values(values).returning({ id: announcements.id });
    await log(admin.id, "announcement.create", "announcement", row.id);
  }
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function publishAnnouncement(id: string, isPublished: boolean) {
  const admin = await requirePermission("community.write");
  await db
    .update(announcements)
    .set({ isPublished, publishedAt: isPublished ? new Date() : null })
    .where(eq(announcements.id, id));
  await log(admin.id, isPublished ? "announcement.publish" : "announcement.unpublish", "announcement", id);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function deleteAnnouncement(id: string) {
  const admin = await requirePermission("community.write");
  await db.delete(announcements).where(eq(announcements.id, id));
  await log(admin.id, "announcement.delete", "announcement", id);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

// ---------- Gallery ----------
/** Upload an image (data URI / URL) to Cloudinary and create a gallery row. */
export async function uploadGalleryPhoto(input: {
  file: string;
  caption?: string | null;
  city?: City | null;
  eventId?: string | null;
  approved?: boolean;
}) {
  const admin = await requirePermission("community.write");
  const url = await uploadToCloudinary(input.file, { folder: "steerclub/gallery" });
  if (!url) return { ok: false as const, error: "Image upload failed (Cloudinary not configured?)." };
  const [row] = await db
    .insert(galleryPhotos)
    .values({
      imageUrl: url,
      caption: input.caption || null,
      city: input.city ?? null,
      eventId: input.eventId || null,
      uploadedById: admin.id,
      approved: input.approved ?? true, // admin uploads are pre-approved
    })
    .returning({ id: galleryPhotos.id });
  await log(admin.id, "gallery.upload", "gallery_photo", row.id);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
  revalidatePath("/community");
  return { ok: true as const, id: row.id };
}

export async function approveGalleryPhoto(id: string, approved: boolean) {
  const admin = await requirePermission("community.write");
  await db.update(galleryPhotos).set({ approved }).where(eq(galleryPhotos.id, id));
  await log(admin.id, approved ? "gallery.approve" : "gallery.unapprove", "gallery_photo", id);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
  revalidatePath("/community");
}

export async function deleteGalleryPhoto(id: string) {
  const admin = await requirePermission("community.write");
  await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  await log(admin.id, "gallery.delete", "gallery_photo", id);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
  revalidatePath("/community");
}
