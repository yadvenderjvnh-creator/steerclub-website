"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  assessmentBookings,
  programBookings,
  leads,
  leadActivities,
  activityLog,
  steerScores,
  waitlist,
} from "@/lib/db/schema";
import { notifyUserByEmail } from "@/lib/portal/notify";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "refunded";
type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

async function logActivity(
  actorId: string,
  action: string,
  entity: string,
  entityId: string,
  meta?: Record<string, unknown>
) {
  await db.insert(activityLog).values({ actorId, action, entity, entityId, meta });
}

export async function updateBookingStatus(
  kind: "assessment" | "program",
  id: string,
  status: BookingStatus
) {
  const admin = await requireRole(["admin"]);
  if (kind === "assessment") {
    await db
      .update(assessmentBookings)
      .set({ status, ...(status === "confirmed" ? { confirmedAt: new Date() } : {}) })
      .where(eq(assessmentBookings.id, id));
  } else {
    await db.update(programBookings).set({ status }).where(eq(programBookings.id, id));
  }
  await logActivity(admin.id, `booking.${status}`, `${kind}_booking`, id);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function updateLead(
  id: string,
  data: {
    status?: LeadStatus;
    stage?: string | null;
    nextFollowUpAt?: string | null;
    notes?: string | null;
  }
) {
  const admin = await requireRole(["admin"]);
  await db
    .update(leads)
    .set({
      ...(data.status ? { status: data.status } : {}),
      stage: data.stage ?? null,
      nextFollowUpAt: data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id));
  await logActivity(admin.id, "lead.update", "lead", id, { status: data.status });
  revalidatePath("/admin/leads");
}

export async function addLeadActivity(leadId: string, type: string, note: string) {
  const admin = await requireRole(["admin"]);
  await db.insert(leadActivities).values({ leadId, type, note, createdById: admin.id });
  await db.update(leads).set({ updatedAt: new Date() }).where(eq(leads.id, leadId));
  revalidatePath("/admin/leads");
}

export async function convertWaitlistToLead(waitlistId: string) {
  const admin = await requireRole(["admin"]);
  const rows = await db.select().from(waitlist).where(eq(waitlist.id, waitlistId)).limit(1);
  const w = rows[0];
  if (!w) return;
  const inserted = await db
    .insert(leads)
    .values({
      name: w.name,
      email: w.email,
      phone: w.phone,
      city: w.city,
      source: w.source ?? "waitlist",
      status: "new",
    })
    .returning({ id: leads.id });
  await logActivity(admin.id, "lead.create_from_waitlist", "lead", inserted[0].id, {
    waitlistId,
  });
  revalidatePath("/admin/leads");
}

export async function recordAssessment(input: {
  email: string;
  total: number;
  dimensions: {
    vehicleControl: number;
    hazardPerception: number;
    cityNavigation: number;
    highwayDriving: number;
    allConditions: number;
    defensiveDriving: number;
  };
  recommendedProgram: string;
  assessmentDate: string;
}) {
  const admin = await requireRole(["admin"]);
  await db.insert(steerScores).values({
    guestEmail: input.email.toLowerCase().trim(),
    total: input.total,
    dimensions: input.dimensions,
    recommendedProgram: input.recommendedProgram,
    assessmentDate: new Date(input.assessmentDate),
  });
  await logActivity(admin.id, "assessment.record", "steer_score", input.email, {
    total: input.total,
  });
  await notifyUserByEmail(input.email, {
    type: "score",
    title: "Your Steer Score is ready",
    body: `You scored ${input.total}/100. See your full breakdown and recommended program.`,
    link: "/dashboard/score",
  });
  revalidatePath("/admin/assessments");
}
