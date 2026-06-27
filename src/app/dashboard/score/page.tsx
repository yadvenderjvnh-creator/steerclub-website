import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getLatestScore, deriveRating } from "@/lib/portal/queries";
import { getRecommendedProgram } from "@/lib/utils";

export const metadata: Metadata = { title: "My Steer Score — Dashboard" };
export const dynamic = "force-dynamic";

const DIM_LABELS: Record<string, string> = {
  vehicleControl: "Vehicle Control",
  hazardPerception: "Hazard Perception",
  cityNavigation: "City Navigation",
  highwayDriving: "Highway Driving",
  allConditions: "All Conditions",
  defensiveDriving: "Defensive Driving",
};

export default async function DashboardScorePage() {
  const user = await requireUser();
  const { latest, previous } = await getLatestScore(user);

  if (!latest) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading font-black text-2xl text-white uppercase">My Steer Score</h1>
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-heading font-black text-xl text-white uppercase mb-2">No score yet</p>
          <p className="text-white/50 font-body text-sm mb-6 max-w-md mx-auto">
            Your Steer Score is a 30-minute in-vehicle assessment across 6 dimensions. Book yours to
            see exactly where you stand.
          </p>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:bg-lime/90 transition-colors"
          >
            Take Your Score — ₹299
          </Link>
        </div>
      </div>
    );
  }

  const rating = deriveRating(latest.total);
  const rec = getRecommendedProgram(latest.total);
  const delta = previous ? latest.total - previous.total : null;
  const dims = latest.dimensions;
  const assessedAt = new Date(latest.assessmentDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading font-black text-2xl text-white uppercase">My Steer Score</h1>
          <p className="text-steel text-sm font-ui mt-1">Last assessed: {assessedAt}</p>
        </div>
        <a
          href="/dashboard/score/report"
          className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-xs tracking-wide uppercase px-4 py-2.5 hover:border-lime/50 hover:text-lime transition-all"
        >
          <Download className="w-4 h-4" /> Download PDF
        </a>
      </div>

      {/* Score card */}
      <div className="glass rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Gauge */}
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="68" fill="none" stroke="#2B2B2B" strokeWidth="14" />
                <circle
                  cx="80" cy="80" r="68"
                  fill="none"
                  stroke="#D7FF2F"
                  strokeWidth="14"
                  strokeDasharray="427"
                  strokeDashoffset={427 - (427 * latest.total) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading font-black text-5xl text-white">{latest.total}</span>
                <span className="text-sm text-steel font-ui">/ 100</span>
              </div>
            </div>
            <p className={`font-heading font-black uppercase text-sm ${rating.color}`}>{rating.label}</p>
            {delta !== null && (
              <p className="text-xs text-steel font-ui mt-1">
                {delta >= 0 ? "Up" : "Down"} from {previous!.total} ({delta >= 0 ? "+" : ""}
                {delta} points)
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <p className="text-xs font-ui uppercase tracking-widest text-steel mb-4">Score Breakdown</p>
            {Object.entries(dims).map(([key, score]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-ui text-white/70">{DIM_LABELS[key] ?? key}</span>
                  <span className="text-xs font-heading font-black text-white">{score}</span>
                </div>
                <div className="h-1.5 bg-graphite rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 70 ? "#D7FF2F" : score >= 55 ? "#F2C94C" : "#EB5757",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass rounded-xl p-6">
        <p className="text-xs font-ui uppercase tracking-widest text-lime mb-2">Recommended Next Step</p>
        <h2 className="font-heading font-black text-xl text-white uppercase mb-2">{rec.name}</h2>
        <p className="text-white/50 font-body text-sm mb-4">{rec.forProfile}</p>
        <Link
          href={`/programs/${rec.slug}`}
          className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-colors"
        >
          View Program →
        </Link>
      </div>
    </div>
  );
}
