"use server";

import { and, eq, sql } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  cohorts,
  programs,
  programSessions,
  programBookings,
  attendance,
  sessionFeedback,
  certificates,
  instructors,
  users,
  activityLog,
} from "@/lib/db/schema";
import { notifyUserByEmail } from "@/lib/portal/notify";

type City = "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai";
type AttStatus = "present" | "absent" | "late" | "excused";

async function log(actorId: string, action: string, entity: string, entityId: string, meta?: Record<string, unknown>) {
  await db.insert(activityLog).values({ actorId, action, entity, entityId, meta });
}

// ---------- Cohorts & sessions (admin) ----------

export async function createCohort(input: {
  programId: string;
  city: City;
  startDate: string;
  maxSize: number;
  instructorId?: string | null;
}) {
  const admin = await requireRole(["admin"]);
  const inserted = await db
    .insert(cohorts)
    .values({
      programId: input.programId,
      city: input.city,
      startDate: new Date(input.startDate),
      maxSize: input.maxSize,
      instructorId: input.instructorId || null,
    })
    .returning({ id: cohorts.id });
  await log(admin.id, "cohort.create", "cohort", inserted[0].id, { programId: input.programId });
  revalidatePath("/admin/programs");
  return inserted[0].id;
}

/** Auto-generate the program's session count for a cohort, weekly from the start date. */
export async function generateSessions(cohortId: string) {
  const admin = await requireRole(["admin"]);
  const rows = await db
    .select({ start: cohorts.startDate, instructorId: cohorts.instructorId, sessions: programs.sessions })
    .from(cohorts)
    .innerJoin(programs, eq(cohorts.programId, programs.id))
    .where(eq(cohorts.id, cohortId))
    .limit(1);
  const c = rows[0];
  if (!c) return;
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(programSessions).where(eq(programSessions.cohortId, cohortId));
  if ((existing[0]?.c ?? 0) > 0) return; // don't duplicate
  const start = new Date(c.start);
  const values = Array.from({ length: c.sessions }, (_, i) => ({
    cohortId,
    sessionNo: i + 1,
    scheduledAt: new Date(start.getTime() + i * 7 * 86_400_000),
    instructorId: c.instructorId ?? null,
  }));
  await db.insert(programSessions).values(values);
  await log(admin.id, "cohort.generate_sessions", "cohort", cohortId, { count: c.sessions });
  revalidatePath(`/admin/programs/cohorts/${cohortId}`);
}

export async function updateSession(sessionId: string, data: { scheduledAt?: string; location?: string; status?: "scheduled" | "completed" | "cancelled" }) {
  const admin = await requireRole(["admin"]);
  await db
    .update(programSessions)
    .set({
      ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
      ...(data.location !== undefined ? { location: data.location } : {}),
      ...(data.status ? { status: data.status } : {}),
    })
    .where(eq(programSessions.id, sessionId));
  await log(admin.id, "session.update", "program_session", sessionId);
  revalidatePath("/admin/programs");
}

export async function assignEnrollee(programBookingId: string, cohortId: string) {
  const admin = await requireRole(["admin"]);
  await db.update(programBookings).set({ cohortId }).where(eq(programBookings.id, programBookingId));
  await db.update(cohorts).set({ currentSize: sql`${cohorts.currentSize} + 1` }).where(eq(cohorts.id, cohortId));
  await log(admin.id, "cohort.assign_enrollee", "program_booking", programBookingId, { cohortId });
  revalidatePath(`/admin/programs/cohorts/${cohortId}`);
}

// ---------- Attendance & feedback (admin or owning coach) ----------

async function assertSessionAccess(sessionId: string) {
  const user = await getSession();
  if (!user) throw new Error("unauthorized");
  if (user.role === "admin") return user;
  if (user.role === "coach") {
    const rows = await db
      .select({ instructorId: programSessions.instructorId, coachUserId: instructors.userId })
      .from(programSessions)
      .leftJoin(instructors, eq(programSessions.instructorId, instructors.id))
      .where(eq(programSessions.id, sessionId))
      .limit(1);
    if (rows[0]?.coachUserId === user.id) return user;
  }
  throw new Error("forbidden");
}

export async function markAttendance(sessionId: string, userId: string, status: AttStatus) {
  const actor = await assertSessionAccess(sessionId);
  await db
    .insert(attendance)
    .values({ sessionId, userId, status, markedById: actor.id })
    .onConflictDoUpdate({
      target: [attendance.sessionId, attendance.userId],
      set: { status, markedById: actor.id, markedAt: new Date() },
    });
  await log(actor.id, "attendance.mark", "program_session", sessionId, { userId, status });
  revalidatePath("/admin/programs");
  revalidatePath("/admin/coach");
}

export async function saveFeedback(sessionId: string, userId: string, notes: string, skillRatings?: Record<string, number>) {
  const actor = await assertSessionAccess(sessionId);
  // one feedback row per (session,user) — delete prior then insert (no unique constraint).
  await db.delete(sessionFeedback).where(and(eq(sessionFeedback.sessionId, sessionId), eq(sessionFeedback.userId, userId)));
  const instr = await db.select({ id: instructors.id }).from(instructors).where(eq(instructors.userId, actor.id)).limit(1);
  await db.insert(sessionFeedback).values({
    sessionId,
    userId,
    instructorId: instr[0]?.id ?? null,
    notes,
    skillRatings: skillRatings ?? null,
  });
  await log(actor.id, "feedback.save", "program_session", sessionId, { userId });
  revalidatePath("/admin/programs");
  revalidatePath("/admin/coach");
}

export async function markSessionComplete(sessionId: string) {
  const actor = await assertSessionAccess(sessionId);
  await db.update(programSessions).set({ status: "completed" }).where(eq(programSessions.id, sessionId));
  await log(actor.id, "session.complete", "program_session", sessionId);
  revalidatePath("/admin/programs");
  revalidatePath("/admin/coach");
}

// ---------- Program completion + certificate (admin) ----------

export async function completeProgram(programBookingId: string) {
  const admin = await requireRole(["admin"]);
  const rows = await db
    .select({ id: programBookings.id, userId: programBookings.userId, email: programBookings.email, programId: programBookings.programId })
    .from(programBookings)
    .where(eq(programBookings.id, programBookingId))
    .limit(1);
  const b = rows[0];
  if (!b) return;
  await db.update(programBookings).set({ status: "completed" }).where(eq(programBookings.id, b.id));

  // Issue a certificate if the booking is tied to a user.
  if (b.userId) {
    const exists = await db
      .select({ id: certificates.id })
      .from(certificates)
      .where(and(eq(certificates.userId, b.userId), eq(certificates.programId, b.programId)))
      .limit(1);
    if (!exists[0]) {
      const serial = `SC-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
      await db.insert(certificates).values({ userId: b.userId, programId: b.programId, serial });
    }
  }
  await notifyUserByEmail(b.email, {
    type: "program",
    title: "Program complete — certificate ready",
    body: "Congratulations! Download your SteerClub certificate from your dashboard.",
    link: "/dashboard/programs",
  });
  await log(admin.id, "program.complete", "program_booking", b.id);
  revalidatePath("/admin/programs");
}

// ---------- Coaches (admin) ----------

export async function inviteCoach(input: {
  name: string;
  email: string;
  city: City;
  ratePerSession?: number;
  bio?: string;
}) {
  const admin = await requireRole(["admin"]);
  const email = input.email.toLowerCase().trim();

  // Find-or-create the user, set role coach.
  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  let userId: string;
  if (existingUser[0]) {
    userId = existingUser[0].id;
    await db.update(users).set({ role: "coach" }).where(eq(users.id, userId));
  } else {
    const inserted = await db.insert(users).values({ email, name: input.name, role: "coach" }).returning({ id: users.id });
    userId = inserted[0].id;
  }

  // Upsert the instructor row by email.
  const existingInstr = await db.select({ id: instructors.id }).from(instructors).where(eq(instructors.email, email)).limit(1);
  if (existingInstr[0]) {
    await db
      .update(instructors)
      .set({ userId, name: input.name, city: input.city, ratePerSession: input.ratePerSession ?? 0, isActive: true })
      .where(eq(instructors.id, existingInstr[0].id));
  } else {
    await db.insert(instructors).values({
      userId,
      email,
      name: input.name,
      bio: input.bio ?? "SteerClub certified driving coach.",
      city: input.city,
      ratePerSession: input.ratePerSession ?? 0,
      certifiedAt: new Date(),
    });
  }
  await log(admin.id, "coach.invite", "instructor", email);
  revalidatePath("/admin/coaches");
}
