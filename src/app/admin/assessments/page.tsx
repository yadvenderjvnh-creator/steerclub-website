import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { steerScores } from "@/lib/db/schema";
import { AssessmentManager, type ScoreRow } from "./assessment-manager";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const scores = await db
    .select({
      id: steerScores.id,
      guestEmail: steerScores.guestEmail,
      total: steerScores.total,
      recommendedProgram: steerScores.recommendedProgram,
      assessmentDate: steerScores.assessmentDate,
    })
    .from(steerScores)
    .orderBy(desc(steerScores.assessmentDate));

  const rows: ScoreRow[] = scores.map((s) => ({
    id: s.id,
    email: s.guestEmail ?? "—",
    total: s.total,
    recommendedProgram: s.recommendedProgram ?? "—",
    assessmentDate: s.assessmentDate.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Assessments
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Steer Scores</h1>
      </div>
      <AssessmentManager rows={rows} />
    </div>
  );
}
