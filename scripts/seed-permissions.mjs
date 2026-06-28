import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const ADMIN_KEYS = [
  "leads.write", "bookings.write", "students.read", "assessments.write",
  "programs.write", "coaches.write", "community.write", "payments.read",
  "payments.refund", "marketing.write", "reports.read", "content.write",
  "settings.manage",
];

for (const key of ADMIN_KEYS) {
  await sql`insert into role_permissions (role, permission_key) values ('admin', ${key}) on conflict (role, permission_key) do nothing`;
}
console.log(`seeded ${ADMIN_KEYS.length} admin permissions`);
