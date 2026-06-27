// One-off: create CRM leads for existing bookers who aren't leads yet.
// Run: DATABASE_URL="postgres://..." node scripts/backfill-leads.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Assessment bookers → leads (status converted if any paid, else new)
  const a = await sql`
    INSERT INTO leads (name, email, phone, city, source, status)
    SELECT
      (array_agg(b.name))[1], lower(b.email), (array_agg(b.phone))[1], (array_agg(b.city))[1],
      'assessment-booking',
      (CASE WHEN bool_or(b.status IN ('confirmed','completed')) THEN 'converted' ELSE 'new' END)::lead_status
    FROM assessment_bookings b
    WHERE b.email IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM leads l WHERE lower(l.email) = lower(b.email))
    GROUP BY lower(b.email)
    RETURNING id`;

  // Program bookers → leads (skips any email now already a lead)
  const p = await sql`
    INSERT INTO leads (name, email, phone, city, source, status)
    SELECT
      (array_agg(b.name))[1], lower(b.email), (array_agg(b.phone))[1], (array_agg(b.city))[1],
      'program-booking',
      (CASE WHEN bool_or(b.status IN ('confirmed','completed')) THEN 'converted' ELSE 'new' END)::lead_status
    FROM program_bookings b
    WHERE b.email IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM leads l WHERE lower(l.email) = lower(b.email))
    GROUP BY lower(b.email)
    RETURNING id`;

  console.log(`Backfilled leads → assessment: ${a.length}, program: ${p.length}`);
  const total = await sql`SELECT count(*)::int c FROM leads`;
  console.log(`Total leads now: ${total[0].c}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
