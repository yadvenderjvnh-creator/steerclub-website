import { eq, and, isNull, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  cohorts,
  programs,
  instructors,
  programSessions,
  programBookings,
  attendance,
  sessionFeedback,
} from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { CohortDetail, type SessionRow, type EnrolleeRow, type UnassignedRow } from "./cohort-detail";

export const dynamic = "force-dynamic";

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("programs.write");
  const { id } = await params;

  const cohortRows = await db
    .select({
      id: cohorts.id,
      programId: cohorts.programId,
      programName: programs.name,
      city: cohorts.city,
      startDate: cohorts.startDate,
      maxSize: cohorts.maxSize,
      currentSize: cohorts.currentSize,
      coachName: instructors.name,
    })
    .from(cohorts)
    .innerJoin(programs, eq(cohorts.programId, programs.id))
    .leftJoin(instructors, eq(cohorts.instructorId, instructors.id))
    .where(eq(cohorts.id, id))
    .limit(1);
  const cohort = cohortRows[0];
  if (!cohort) notFound();

  const [sessionRows, enrolleeRows, unassignedRows] = await Promise.all([
    db.select().from(programSessions).where(eq(programSessions.cohortId, id)).orderBy(programSessions.sessionNo),
    db
      .select({ id: programBookings.id, name: programBookings.name, email: programBookings.email, userId: programBookings.userId, status: programBookings.status })
      .from(programBookings)
      .where(eq(programBookings.cohortId, id)),
    db
      .select({ id: programBookings.id, name: programBookings.name, email: programBookings.email })
      .from(programBookings)
      .where(and(eq(programBookings.programId, cohort.programId), eq(programBookings.status, "confirmed"), isNull(programBookings.cohortId))),
  ]);

  const sessionIds = sessionRows.map((s) => s.id);
  const [att, fb] = await Promise.all([
    sessionIds.length ? db.select({ sessionId: attendance.sessionId, userId: attendance.userId, status: attendance.status }).from(attendance).where(inArray(attendance.sessionId, sessionIds)) : Promise.resolve([]),
    sessionIds.length ? db.select({ sessionId: sessionFeedback.sessionId, userId: sessionFeedback.userId, notes: sessionFeedback.notes }).from(sessionFeedback).where(inArray(sessionFeedback.sessionId, sessionIds)) : Promise.resolve([]),
  ]);

  const sessions: SessionRow[] = sessionRows.map((s) => ({
    id: s.id,
    sessionNo: s.sessionNo,
    scheduledAt: s.scheduledAt.toISOString(),
    status: s.status,
    location: s.location,
  }));
  const enrollees: EnrolleeRow[] = enrolleeRows.map((e) => ({ id: e.id, name: e.name, email: e.email, userId: e.userId, status: e.status }));
  const unassigned: UnassignedRow[] = unassignedRows.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  const attendanceMap: Record<string, string> = {};
  for (const a of att) if (a.userId) attendanceMap[`${a.sessionId}:${a.userId}`] = a.status;
  const feedbackMap: Record<string, string> = {};
  for (const f of fb) if (f.userId) feedbackMap[`${f.sessionId}:${f.userId}`] = f.notes ?? "";

  return (
    <div>
      <Link href="/admin/programs" className="text-xs font-ui text-steel hover:text-lime transition-colors mb-6 inline-block">← Programs & Cohorts</Link>
      <div className="mb-6">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2 capitalize">{cohort.city} · {new Date(cohort.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">{cohort.programName}</h1>
        <p className="text-steel text-sm font-ui mt-1">Coach: {cohort.coachName ?? "Unassigned"} · {cohort.currentSize}/{cohort.maxSize} enrolled</p>
      </div>
      <CohortDetail
        cohortId={cohort.id}
        sessions={sessions}
        enrollees={enrollees}
        unassigned={unassigned}
        attendanceMap={attendanceMap}
        feedbackMap={feedbackMap}
      />
    </div>
  );
}
