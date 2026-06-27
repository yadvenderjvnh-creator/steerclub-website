import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, users, memberships, assessmentBookings, programBookings } from "@/lib/db/schema";

export type Recipient = { email: string; name: string | null; userId?: string | null };

export const SEGMENTS: { key: string; label: string }[] = [
  { key: "all_leads", label: "All leads" },
  { key: "members_active", label: "Active members" },
  { key: "assessment_customers", label: "Assessment customers" },
  { key: "program_customers", label: "Program customers" },
  { key: "city:chandigarh", label: "City — Chandigarh" },
  { key: "city:delhi", label: "City — Delhi" },
  { key: "city:bangalore", label: "City — Bangalore" },
  { key: "city:mumbai", label: "City — Mumbai" },
  { key: "city:hyderabad", label: "City — Hyderabad" },
  { key: "city:pune", label: "City — Pune" },
  { key: "city:chennai", label: "City — Chennai" },
];

const PAID = ["confirmed", "completed"] as const;

/** Resolve a segment key into a de-duped recipient list. */
export async function resolveSegment(key: string): Promise<Recipient[]> {
  let rows: Recipient[] = [];

  if (key === "all_leads") {
    rows = (await db.select({ email: leads.email, name: leads.name }).from(leads).where(isNotNull(leads.email))).map((r) => ({ email: r.email!, name: r.name }));
  } else if (key === "members_active") {
    rows = await db
      .select({ email: users.email, name: users.name, userId: users.id })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.status, "active"));
  } else if (key === "assessment_customers") {
    rows = (await db.select({ email: assessmentBookings.email, name: assessmentBookings.name }).from(assessmentBookings).where(inArray(assessmentBookings.status, PAID))).map((r) => ({ email: r.email, name: r.name }));
  } else if (key === "program_customers") {
    rows = (await db.select({ email: programBookings.email, name: programBookings.name }).from(programBookings).where(inArray(programBookings.status, PAID))).map((r) => ({ email: r.email, name: r.name }));
  } else if (key.startsWith("city:")) {
    const city = key.slice(5);
    rows = await db
      .select({ email: users.email, name: users.name, userId: users.id })
      .from(users)
      .where(sql`${users.city} = ${city}`);
  }

  // De-dupe by lowercased email.
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const r of rows) {
    if (!r.email) continue;
    const e = r.email.toLowerCase().trim();
    if (seen.has(e)) continue;
    seen.add(e);
    out.push({ email: e, name: r.name, userId: r.userId ?? null });
  }
  return out;
}

export function segmentLabel(key: string): string {
  return SEGMENTS.find((s) => s.key === key)?.label ?? key;
}
