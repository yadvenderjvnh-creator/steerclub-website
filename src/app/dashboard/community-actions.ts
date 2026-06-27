"use server";

import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { events, eventRegistrations, memberships, notifications, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";

type RsvpResult = { ok: boolean; error?: string };

/** RSVP to a free event (login-gated). Paid events go through Razorpay create-order. */
export async function rsvpEvent(eventSlug: string): Promise<RsvpResult> {
  const user = await requireUser();
  const [ev] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, eventSlug), eq(events.isPublished, true)))
    .limit(1);
  if (!ev) return { ok: false, error: "Event not found." };
  if ((ev.price ?? 0) > 0) {
    return { ok: false, error: "This event requires payment — register from the event page." };
  }
  if (ev.memberOnly) {
    const [m] = await db
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.status, "active")))
      .limit(1);
    if (!m) return { ok: false, error: "This event is for members only. Join SteerClub to RSVP." };
  }

  const [existing] = await db
    .select({ id: eventRegistrations.id, status: eventRegistrations.status })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.userId, user.id), eq(eventRegistrations.eventId, ev.id)))
    .limit(1);
  if (existing?.status === "confirmed") return { ok: false, error: "You're already registered." };

  const [reg] = await db
    .select({ c: count() })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, ev.id), eq(eventRegistrations.status, "confirmed")));
  if ((reg?.c ?? 0) >= ev.capacity) return { ok: false, error: "This event is full." };

  if (existing) {
    await db
      .update(eventRegistrations)
      .set({ status: "confirmed", amount: 0 })
      .where(eq(eventRegistrations.id, existing.id));
  } else {
    await db
      .insert(eventRegistrations)
      .values({ userId: user.id, eventId: ev.id, amount: 0, status: "confirmed" });
  }

  // Confirmation: in-app notification + email.
  await db.insert(notifications).values({
    userId: user.id,
    type: "event",
    title: `You're going to ${ev.title}`,
    body: `${new Date(ev.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · ${ev.location}`,
    link: "/dashboard/community",
  });
  await sendEmail({
    to: user.email,
    subject: `RSVP confirmed — ${ev.title}`,
    html: `<p>Hi ${user.name},</p><p>You're registered for <strong>${ev.title}</strong> on ${new Date(ev.eventDate).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })} at ${ev.location}.</p><p>See you there. Earn the Road.<br/>— SteerClub</p>`,
  });

  revalidatePath("/dashboard/community");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/events");
  return { ok: true };
}

/** Cancel a free RSVP. Paid registrations require a refund (Phase 5) and are left intact. */
export async function cancelRsvp(eventSlug: string): Promise<RsvpResult> {
  const user = await requireUser();
  const [ev] = await db.select({ id: events.id }).from(events).where(eq(events.slug, eventSlug)).limit(1);
  if (!ev) return { ok: false, error: "Event not found." };
  await db
    .delete(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.userId, user.id),
        eq(eventRegistrations.eventId, ev.id),
        eq(eventRegistrations.status, "confirmed"),
        eq(eventRegistrations.amount, 0)
      )
    );
  revalidatePath("/dashboard/community");
  revalidatePath("/dashboard/calendar");
  return { ok: true };
}

/** Toggle this member's visibility in the community directory (no other fields touched). */
export async function setDirectoryVisible(visible: boolean): Promise<void> {
  const user = await requireUser();
  await db
    .update(users)
    .set({ directoryVisible: visible, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard/community");
  revalidatePath("/dashboard/profile");
}

export type { RsvpResult };
