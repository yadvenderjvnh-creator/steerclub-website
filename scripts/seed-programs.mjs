// Seed the programs table from the canonical PROGRAMS data (src/lib/utils.ts).
// Idempotent upsert by slug. Run: DATABASE_URL="postgres://..." node scripts/seed-programs.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const PROGRAMS = [
  { slug: "confidence-foundation", name: "Confidence Foundation™", tagline: "Your license was just the beginning.", description: "For the driver who has a license but hasn't truly driven. Structured first success in a safe, supportive cohort environment.", price: 599900, memberPrice: 509900, scoreRange: [0, 50], sessions: 4, durationHours: 8, forProfile: "You got your license. You haven't used it. The car sits in the driveway. You know you should drive — you just don't. This is where it starts.", outcomes: ["Start and park confidently in real traffic", "Handle lane changes without hesitation", "Drive solo on familiar city routes", "Understand what your score is measuring and why"], cities: ["chandigarh", "delhi", "bangalore"] },
  { slug: "city-mastery", name: "City Mastery™", tagline: "The city doesn't forgive the unprepared. Be prepared.", description: "For the daily commuter who drives on autopilot. Close the gap between adequate and genuinely capable in Indian city conditions.", price: 799900, memberPrice: 679900, scoreRange: [45, 70], sessions: 5, durationHours: 10, forProfile: "You drive every day. But parking still stresses you out. Merging in heavy traffic feels like a gamble. You avoid certain roads. That's not normal — it's fixable.", outcomes: ["Parallel park and reverse into tight spots with precision", "Read traffic 4–5 cars ahead and anticipate hazards", "Navigate roundabouts and intersections at speed", "Drive confidently in rain, peak-hour traffic, and at night"], cities: ["chandigarh", "delhi", "bangalore", "mumbai"] },
  { slug: "highway-freedom", name: "Highway Freedom™", tagline: "Some roads ask more of you. Now you can give it.", description: "For the driver who avoids highways. Master merging at speed, sustained highway discipline, and overtaking safely.", price: 899900, memberPrice: 764900, scoreRange: [55, 75], sessions: 4, durationHours: 10, forProfile: "You drive to work every day. But highway entries make you sweat. Merging at speed feels like a gamble. That's not a flaw — it's a gap. This program closes it.", outcomes: ["Merge onto a 100km/h highway without hesitation", "Hold lane discipline at sustained speed in heavy traffic", "Overtake safely and read traffic 5+ cars ahead", "Handle a tyre emergency at highway speed"], cities: ["chandigarh", "delhi", "bangalore", "mumbai", "pune"] },
  { slug: "all-conditions", name: "All Conditions™", tagline: "Rain. Night. Mountain. Ready.", description: "For the driver who avoids specific conditions. Master wet roads, night driving, and difficult visibility scenarios.", price: 899900, memberPrice: 764900, scoreRange: [55, 80], sessions: 4, durationHours: 10, forProfile: "You drive fine in good conditions. But rain changes everything. Night driving feels uncertain. You know there are conditions you're not ready for. Now is when you get ready.", outcomes: ["Control the car on wet roads at normal driving speeds", "Understand stopping distances in rain and on slopes", "Navigate confidently in low-visibility conditions", "Handle a car when traction is compromised"], cities: ["chandigarh", "delhi", "bangalore"] },
  { slug: "roadtrip-ready", name: "Roadtrip Ready™", tagline: "Ladakh isn't for everyone. It will be for you.", description: "For the road trip dreamer. Prepare for mountain roads, long-distance driving, and everything India's roads throw at you.", price: 1099900, memberPrice: 934900, scoreRange: [60, 100], sessions: 5, durationHours: 14, forProfile: "You follow road trip accounts on Instagram. You've looked up Spiti Valley routes. You know you want it — you just don't feel ready yet. This program changes that.", outcomes: ["Navigate mountain passes and hairpin bends with control", "Plan and execute a 500km+ road trip independently", "Handle altitude changes, gradient descents, and narrow mountain roads", "Drive through the night safely over long distances"], cities: ["chandigarh", "delhi"] },
];

async function main() {
  for (let i = 0; i < PROGRAMS.length; i++) {
    const p = PROGRAMS[i];
    await sql`
      INSERT INTO programs (slug, name, tagline, description, price, member_price, score_min, score_max, sessions, duration_hours, outcomes, for_profile, cities, is_active, display_order)
      VALUES (${p.slug}, ${p.name}, ${p.tagline}, ${p.description}, ${p.price}, ${p.memberPrice}, ${p.scoreRange[0]}, ${p.scoreRange[1]}, ${p.sessions}, ${p.durationHours}, ${JSON.stringify(p.outcomes)}::jsonb, ${p.forProfile}, ${JSON.stringify(p.cities)}::jsonb, true, ${i})
      ON CONFLICT (slug) DO UPDATE SET
        name=EXCLUDED.name, tagline=EXCLUDED.tagline, description=EXCLUDED.description,
        price=EXCLUDED.price, member_price=EXCLUDED.member_price, score_min=EXCLUDED.score_min,
        score_max=EXCLUDED.score_max, sessions=EXCLUDED.sessions, duration_hours=EXCLUDED.duration_hours,
        outcomes=EXCLUDED.outcomes, for_profile=EXCLUDED.for_profile, cities=EXCLUDED.cities,
        display_order=EXCLUDED.display_order`;
  }
  const rows = await sql`SELECT slug, name FROM programs ORDER BY display_order`;
  console.log(`Seeded ${rows.length} programs:`, rows.map((r) => r.slug).join(", "));
}

main().catch((e) => { console.error(e); process.exit(1); });
