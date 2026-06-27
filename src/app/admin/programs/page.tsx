import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { programs, cohorts, instructors, programBookings } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { ProgramsManager, type CohortRow, type ProgramOpt, type CoachOpt } from "./programs-manager";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  await requireRole(["admin"]);

  const [programRows, coachRows, cohortRows, unassignedCount] = await Promise.all([
    db.select({ id: programs.id, name: programs.name, sessions: programs.sessions }).from(programs).orderBy(programs.displayOrder),
    db.select({ id: instructors.id, name: instructors.name }).from(instructors).where(eq(instructors.isActive, true)),
    db
      .select({
        id: cohorts.id,
        programName: programs.name,
        city: cohorts.city,
        startDate: cohorts.startDate,
        maxSize: cohorts.maxSize,
        currentSize: cohorts.currentSize,
        isOpen: cohorts.isOpen,
        coachName: instructors.name,
      })
      .from(cohorts)
      .innerJoin(programs, eq(cohorts.programId, programs.id))
      .leftJoin(instructors, eq(cohorts.instructorId, instructors.id))
      .orderBy(desc(cohorts.startDate)),
    db.select({ c: sql<number>`count(*)::int` }).from(programBookings).where(sql`${programBookings.status} = 'confirmed' AND ${programBookings.cohortId} IS NULL`),
  ]);

  const programOpts: ProgramOpt[] = programRows.map((p) => ({ id: p.id, name: p.name, sessions: p.sessions }));
  const coachOpts: CoachOpt[] = coachRows.map((c) => ({ id: c.id, name: c.name }));
  const cohortData: CohortRow[] = cohortRows.map((c) => ({
    id: c.id,
    programName: c.programName,
    city: c.city,
    startDate: c.startDate.toISOString(),
    maxSize: c.maxSize,
    currentSize: c.currentSize,
    isOpen: c.isOpen,
    coachName: c.coachName,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Delivery</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Programs & Cohorts</h1>
        {unassignedCount[0]?.c > 0 && (
          <p className="text-steel text-sm font-ui mt-1">
            {unassignedCount[0].c} paid enrollee(s) awaiting cohort assignment.
          </p>
        )}
      </div>
      <ProgramsManager programs={programOpts} coaches={coachOpts} cohorts={cohortData} />
    </div>
  );
}
