import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { instructors, programSessions } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { CoachesManager, type CoachRow } from "./coaches-manager";

export const dynamic = "force-dynamic";

export default async function AdminCoachesPage() {
  await requireRole(["admin"]);

  const [coachRows, sessionCounts] = await Promise.all([
    db.select().from(instructors).orderBy(instructors.name),
    db
      .select({ instructorId: programSessions.instructorId, c: sql<number>`count(*)::int` })
      .from(programSessions)
      .where(eq(programSessions.status, "completed"))
      .groupBy(programSessions.instructorId),
  ]);

  const counts = new Map<string, number>();
  for (const s of sessionCounts) if (s.instructorId) counts.set(s.instructorId, s.c);

  const coaches: CoachRow[] = coachRows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    city: c.city,
    ratePerSession: c.ratePerSession ?? 0,
    isActive: c.isActive,
    hasLogin: Boolean(c.userId),
    completedSessions: counts.get(c.id) ?? 0,
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Team</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Coaches</h1>
      </div>
      <CoachesManager coaches={coaches} />
    </div>
  );
}
