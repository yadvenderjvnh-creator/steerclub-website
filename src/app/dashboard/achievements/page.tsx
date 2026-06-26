import type { Metadata } from "next";

export const metadata: Metadata = { title: "Achievements — Dashboard" };

const BADGES = [
  { id: "steer-member", name: "Steer Member", desc: "Joined the community", earned: true, icon: "🏅" },
  { id: "first-score", name: "First Score", desc: "Completed your Steer Score assessment", earned: true, icon: "🎯" },
  { id: "city-mastery-complete", name: "City Mastery™ Complete", desc: "Completed the City Mastery program", earned: false, icon: "🏙️" },
  { id: "highway-free", name: "Highway Freedom™", desc: "Completed Highway Freedom program", earned: false, icon: "🛣️" },
  { id: "road-trip-ready", name: "Roadtrip Ready™", desc: "Cleared for the open road", earned: false, icon: "🏔️" },
  { id: "score-70", name: "Score 70+", desc: "Achieved a Steer Score above 70", earned: false, icon: "⬆️" },
  { id: "score-80", name: "Score 80+", desc: "Achieved a Steer Score above 80", earned: false, icon: "🔥" },
  { id: "community-drive", name: "First City Drive", desc: "Attended your first community drive", earned: false, icon: "🚗" },
  { id: "road-trip", name: "Road Trip Member", desc: "Completed a SteerClub road trip", earned: false, icon: "🌄" },
];

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Achievements</h1>
        <p className="text-steel text-sm font-ui mt-1">
          {BADGES.filter(b => b.earned).length} of {BADGES.length} earned
        </p>
      </div>

      {/* Earned */}
      <div>
        <h2 className="font-heading font-black text-xs text-lime uppercase tracking-widest mb-4">Earned</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.filter(b => b.earned).map((badge) => (
            <div key={badge.id} className="glass rounded-xl p-5 text-center">
              <span className="text-3xl mb-3 block">{badge.icon}</span>
              <p className="font-heading font-black text-sm text-white uppercase">{badge.name}</p>
              <p className="text-xs text-steel font-ui mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <h2 className="font-heading font-black text-xs text-steel uppercase tracking-widest mb-4">Locked</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.filter(b => !b.earned).map((badge) => (
            <div key={badge.id} className="glass rounded-xl p-5 text-center opacity-40">
              <span className="text-3xl mb-3 block grayscale">{badge.icon}</span>
              <p className="font-heading font-black text-sm text-white uppercase">{badge.name}</p>
              <p className="text-xs text-steel font-ui mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
