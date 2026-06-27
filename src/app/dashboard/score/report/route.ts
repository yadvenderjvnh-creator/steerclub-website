import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { getLatestScore, deriveRating, getProfile } from "@/lib/portal/queries";
import { getRecommendedProgram } from "@/lib/utils";
import { ScoreReportPDF } from "@/components/portal/score-report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const [{ latest }, profile] = await Promise.all([getLatestScore(user), getProfile(user.id)]);

  if (!latest) {
    return new Response("No Steer Score on record.", { status: 404 });
  }

  const rating = deriveRating(latest.total);
  const rec = getRecommendedProgram(latest.total);

  const buffer = await renderToBuffer(
    ScoreReportPDF({
      name: profile?.name ?? user.name,
      total: latest.total,
      band: rating.label,
      assessedAt: new Date(latest.assessmentDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      dimensions: latest.dimensions as Record<string, number>,
      recommendationName: rec.name,
      recommendationText: rec.forProfile,
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="steerclub-steer-score.pdf"',
    },
  });
}
