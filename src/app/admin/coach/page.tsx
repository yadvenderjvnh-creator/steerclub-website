import { eq, and, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { programSessions, cohorts, programs, programBookings, attendance, sessionFeedback } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { getCoachInstructorId } from "@/lib/delivery/queries";
import { CoachSessions, type CoachSessionRow, type RosterRow } from "./coach-sessions";

export const dynamic = "force-dynamic";

export default async function CoachHomePage() {
  const user = await requireRole(["admin", "coach"]);
  const instructorId = await getCoachInstructorId(user.id);

  if (!instructorId) {
    return (
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase mb-3">Coach</h1>
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-white/60 font-body text-sm">
            Your coach profile isn&apos;t linked to this account yet. Ask an admin to (re-)invite you with this email.
          </p>
        </div>
      </div>
    );
  }

  const sessionRows = await db
    .select({
      id: programSessions.id,
      sessionNo: programSessions.sessionNo,
      scheduledAt: programSessions.scheduledAt,
      status: programSessions.status,
      cohortId: programSessions.cohortId,
      programName: programs.name,
      city: cohorts.city,
    })
    .from(programSessions)
    .innerJoin(cohorts, eq(programSessions.cohortId, cohorts.id))
    .innerJoin(programs, eq(cohorts.programId, programs.id))
    .where(eq(programSessions.instructorId, instructorId))
    .orderBy(programSessions.scheduledAt);

  const cohortIds = [...new Set(sessionRows.map((s) => s.cohortId))];
  const sessionIds = sessionRows.map((s) => s.id);

  const [enrolleeRows, att, fb] = await Promise.all([
    cohortIds.length
      ? db
          .select({ cohortId: programBookings.cohortId, name: programBookings.name, userId: programBookings.userId })
          .from(programBookings)
          .where(and(inArray(programBookings.cohortId, cohortIds), ne(programBookings.status, "cancelled")))
      : Promise.resolve([]),
    sessionIds.length ? db.select({ sessionId: attendance.sessionId, userId: attendance.userId, status: attendance.status }).from(attendance).where(inArray(attendance.sessionId, sessionIds)) : Promise.resolve([]),
    sessionIds.length ? db.select({ sessionId: sessionFeedback.sessionId, userId: sessionFeedback.userId, notes: sessionFeedback.notes }).from(sessionFeedback).where(inArray(sessionFeedback.sessionId, sessionIds)) : Promise.resolve([]),
  ]);

  // roster per cohort (only activated students)
  const rosterByCohort = new Map<string, RosterRow[]>();
  for (const e of enrolleeRows) {
    if (!e.userId || !e.cohortId) continue;
    const arr = rosterByCohort.get(e.cohortId) ?? [];
    arr.push({ name: e.name, userId: e.userId });
    rosterByCohort.set(e.cohortId, arr);
  }

  const attendanceMap: Record<string, string> = {};
  for (const a of att) if (a.userId) attendanceMap[`${a.sessionId}:${a.userId}`] = a.status;
  const feedbackMap: Record<string, string> = {};
  for (const f of fb) if (f.userId) feedbackMap[`${f.sessionId}:${f.userId}`] = f.notes ?? "";

  const sessions: CoachSessionRow[] = sessionRows.map((s) => ({
    id: s.id,
    label: `${s.programName} · Session ${s.sessionNo}`,
    city: s.city,
    scheduledAt: s.scheduledAt.toISOString(),
    status: s.status,
    roster: rosterByCohort.get(s.cohortId) ?? [],
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Coach</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">My Sessions</h1>
      </div>
      <CoachSessions sessions={sessions} attendanceMap={attendanceMap} feedbackMap={feedbackMap} />
    </div>
  );
}
