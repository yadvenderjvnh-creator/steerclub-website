import { and, desc, eq, isNull, or, sql, count, type AnyColumn } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  steerScores,
  programBookings,
  assessmentBookings,
  memberships,
  notifications,
  programs,
  users,
  cohorts,
  programSessions,
  attendance,
  sessionFeedback,
  certificates,
  events,
} from "@/lib/db/schema";

export type PortalUser = { id: string; email: string };

function emailMatch(col: AnyColumn, email: string) {
  return sql`lower(${col}) = ${email.toLowerCase().trim()}`;
}

/** All Steer Scores for the user (latest first), matched by userId OR guest email. */
export async function getScores(user: PortalUser) {
  return db
    .select()
    .from(steerScores)
    .where(or(eq(steerScores.userId, user.id), emailMatch(steerScores.guestEmail, user.email)))
    .orderBy(desc(steerScores.assessmentDate));
}

export async function getLatestScore(user: PortalUser) {
  const rows = await getScores(user);
  return { latest: rows[0] ?? null, previous: rows[1] ?? null, history: rows };
}

/** Program bookings for the user (joined to program name). */
export async function getUserPrograms(user: PortalUser) {
  return db
    .select({
      id: programBookings.id,
      status: programBookings.status,
      amount: programBookings.amount,
      createdAt: programBookings.createdAt,
      programName: programs.name,
      programSlug: programs.slug,
    })
    .from(programBookings)
    .leftJoin(programs, eq(programBookings.programId, programs.id))
    .where(or(eq(programBookings.userId, user.id), emailMatch(programBookings.email, user.email)))
    .orderBy(desc(programBookings.createdAt));
}

/** All payments (assessment + program bookings) for the user, unified + newest first. */
export async function getUserPayments(user: PortalUser) {
  const [asmt, progs] = await Promise.all([
    db
      .select()
      .from(assessmentBookings)
      .where(or(eq(assessmentBookings.userId, user.id), emailMatch(assessmentBookings.email, user.email)))
      .orderBy(desc(assessmentBookings.createdAt)),
    getUserPrograms(user),
  ]);

  const rows = [
    ...asmt.map((b) => ({
      id: b.id,
      item: "Steer Score Assessment",
      amount: b.amount,
      status: b.status,
      paymentId: b.razorpayPaymentId,
      createdAt: b.createdAt.toISOString(),
    })),
    ...progs.map((b) => ({
      id: b.id,
      item: b.programName ?? "Program",
      amount: b.amount,
      status: b.status,
      paymentId: null as string | null,
      createdAt: b.createdAt.toISOString(),
    })),
  ];
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Sessions for cohorts the user is enrolled in (joined to program + the user's own attendance/feedback). */
export async function getUserSessions(user: PortalUser) {
  return db
    .select({
      id: programSessions.id,
      sessionNo: programSessions.sessionNo,
      scheduledAt: programSessions.scheduledAt,
      status: programSessions.status,
      location: programSessions.location,
      programName: programs.name,
      city: cohorts.city,
      attendanceStatus: attendance.status,
      feedback: sessionFeedback.notes,
    })
    .from(programSessions)
    .innerJoin(cohorts, eq(programSessions.cohortId, cohorts.id))
    .innerJoin(programs, eq(cohorts.programId, programs.id))
    .innerJoin(
      programBookings,
      and(
        eq(programBookings.cohortId, cohorts.id),
        or(eq(programBookings.userId, user.id), emailMatch(programBookings.email, user.email))
      )
    )
    .leftJoin(attendance, and(eq(attendance.sessionId, programSessions.id), eq(attendance.userId, user.id)))
    .leftJoin(sessionFeedback, and(eq(sessionFeedback.sessionId, programSessions.id), eq(sessionFeedback.userId, user.id)))
    .orderBy(programSessions.scheduledAt);
}

/** Certificates earned by the user (joined to program name). */
export async function getUserCertificates(user: PortalUser) {
  return db
    .select({ id: certificates.id, serial: certificates.serial, issuedAt: certificates.issuedAt, programId: certificates.programId, programName: programs.name })
    .from(certificates)
    .innerJoin(programs, eq(certificates.programId, programs.id))
    .where(eq(certificates.userId, user.id))
    .orderBy(desc(certificates.issuedAt));
}

/** Published upcoming events (for the calendar). */
export async function getUpcomingEvents() {
  return db
    .select({ id: events.id, title: events.title, eventDate: events.eventDate, location: events.location, city: events.city, type: events.type })
    .from(events)
    .where(and(eq(events.isPublished, true), sql`${events.eventDate} >= now()`))
    .orderBy(events.eventDate)
    .limit(20);
}

export async function getMembership(userId: string) {
  const rows = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "active")))
    .orderBy(desc(memberships.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [r] = await db
    .select({ c: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return r?.c ?? 0;
}

/** Full users row (profile fields not in the session). */
export async function getProfile(userId: string) {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] ?? null;
}

const PROFILE_FIELDS = [
  "phone",
  "city",
  "emergencyContactName",
  "emergencyContactPhone",
  "vehicleOwned",
  "drivingGoals",
] as const;

export function profileCompletion(
  profile: Record<string, unknown> | null
): number {
  if (!profile) return 0;
  const filled = PROFILE_FIELDS.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length;
  // name + email are always present; weight them in for a friendlier number.
  return Math.round(((filled + 2) / (PROFILE_FIELDS.length + 2)) * 100);
}

export type Rating = { label: string; color: string };

export function deriveRating(total: number): Rating {
  if (total >= 90) return { label: "Expert", color: "text-lime" };
  if (total >= 76) return { label: "Skilled", color: "text-lime" };
  if (total >= 61) return { label: "Competent", color: "text-green-400" };
  if (total >= 41) return { label: "Developing", color: "text-yellow-400" };
  return { label: "Beginner", color: "text-orange-400" };
}

export type Badge = { id: string; name: string; desc: string; icon: string; earned: boolean };

export function deriveBadges(input: {
  hasScore: boolean;
  topScore: number;
  completedProgramSlugs: string[];
}): Badge[] {
  const { hasScore, topScore, completedProgramSlugs } = input;
  const has = (slug: string) => completedProgramSlugs.includes(slug);
  return [
    { id: "member", name: "Steer Member", desc: "Joined the community", icon: "🏅", earned: true },
    { id: "first-score", name: "First Score", desc: "Completed your Steer Score assessment", icon: "🎯", earned: hasScore },
    { id: "score-70", name: "Score 70+", desc: "Achieved a Steer Score above 70", icon: "⬆️", earned: topScore >= 70 },
    { id: "score-80", name: "Score 80+", desc: "Achieved a Steer Score above 80", icon: "🔥", earned: topScore >= 80 },
    { id: "confidence", name: "Confidence Foundation™", desc: "Completed Confidence Foundation", icon: "🚗", earned: has("confidence-foundation") },
    { id: "city", name: "City Mastery™", desc: "Completed City Mastery", icon: "🏙️", earned: has("city-mastery") },
    { id: "highway", name: "Highway Freedom™", desc: "Completed Highway Freedom", icon: "🛣️", earned: has("highway-freedom") },
    { id: "conditions", name: "All Conditions™", desc: "Completed All Conditions", icon: "🌧️", earned: has("all-conditions") },
    { id: "roadtrip", name: "Roadtrip Ready™", desc: "Cleared for the open road", icon: "🏔️", earned: has("roadtrip-ready") },
  ];
}
