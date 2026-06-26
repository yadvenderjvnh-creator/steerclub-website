import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Steer Score — Dashboard",
};

export default function DashboardScorePage() {
  const mockScore = {
    total: 65,
    previousTotal: 48,
    assessedAt: "April 15, 2026",
    dimensions: {
      vehicleControl: 72,
      hazardPerception: 68,
      cityNavigation: 75,
      highwayDriving: 51,
      allConditions: 48,
      defensiveDriving: 62,
    },
    recommendedProgram: { name: "Highway Freedom™", slug: "highway-freedom" },
    instructorName: "Instructor Name",
    nextAssessment: "April 2027",
  };

  const dimensionLabels: Record<string, string> = {
    vehicleControl: "Vehicle Control",
    hazardPerception: "Hazard Perception",
    cityNavigation: "City Navigation",
    highwayDriving: "Highway Driving",
    allConditions: "All Conditions",
    defensiveDriving: "Defensive Driving",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">My Steer Score</h1>
        <p className="text-steel text-sm font-ui mt-1">Last assessed: {mockScore.assessedAt}</p>
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
                  strokeDashoffset={427 - (427 * mockScore.total) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading font-black text-5xl text-white">{mockScore.total}</span>
                <span className="text-sm text-steel font-ui">/ 100</span>
              </div>
            </div>
            <p className="font-heading font-black text-white uppercase text-sm">Competent</p>
            <p className="text-xs text-steel font-ui mt-1">Up from {mockScore.previousTotal} (+{mockScore.total - mockScore.previousTotal} points)</p>
          </div>

          {/* Dimensions */}
          <div className="space-y-3">
            <p className="text-xs font-ui uppercase tracking-widest text-steel mb-4">Score Breakdown</p>
            {Object.entries(mockScore.dimensions).map(([key, score]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-ui text-white/70">{dimensionLabels[key]}</span>
                  <span className="text-xs font-heading font-black text-white">{score}</span>
                </div>
                <div className="h-1.5 bg-graphite rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
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
        <h2 className="font-heading font-black text-xl text-white uppercase mb-2">
          {mockScore.recommendedProgram.name}
        </h2>
        <p className="text-white/50 font-body text-sm mb-4">
          Your lowest scores are in highway driving and all-conditions driving.
          Highway Freedom™ specifically addresses these gaps.
        </p>
        <Link
          href={`/programs/${mockScore.recommendedProgram.slug}`}
          className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-colors"
        >
          View Program →
        </Link>
      </div>

      {/* Next assessment */}
      <div className="glass rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-1">Next Re-Assessment</p>
          <p className="font-heading font-black text-white">{mockScore.nextAssessment}</p>
          <p className="text-xs text-steel font-ui mt-0.5">Annual Steer Score re-assessment (Members)</p>
        </div>
        <Link
          href="/score/book"
          className="border border-white/20 text-white font-heading font-black text-xs tracking-wide uppercase px-5 py-2.5 hover:border-lime/50 hover:text-lime transition-all"
        >
          Book Early
        </Link>
      </div>
    </div>
  );
}
