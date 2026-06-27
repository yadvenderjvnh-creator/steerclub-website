import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";

const CITY_VALUES = [
  "chandigarh", "delhi", "bangalore", "mumbai", "hyderabad", "pune", "chennai",
] as const;
type CityValue = (typeof CITY_VALUES)[number];

function normCity(c?: string | null): CityValue | null {
  return c && (CITY_VALUES as readonly string[]).includes(c) ? (c as CityValue) : null;
}

type Contact = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  source: string;
};

/** Capture a booker/contact as a CRM lead, de-duped by email. No-op if no email or a lead already exists. */
export async function upsertLeadFromContact(c: Contact): Promise<void> {
  if (!c.email) return;
  const email = c.email.toLowerCase().trim();
  try {
    const existing = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.email, email))
      .limit(1);
    if (existing[0]) return; // already a lead — don't duplicate
    await db.insert(leads).values({
      name: c.name ?? null,
      email,
      phone: c.phone ?? null,
      city: normCity(c.city),
      source: c.source,
      status: "new",
    });
  } catch (err) {
    // Lead capture must never block a booking/payment.
    console.error("upsertLeadFromContact failed:", err);
  }
}

/** Mark a lead as converted once they pay. No-op if no matching lead. */
export async function markLeadConverted(email?: string | null): Promise<void> {
  if (!email) return;
  const e = email.toLowerCase().trim();
  try {
    await db.update(leads).set({ status: "converted", updatedAt: new Date() }).where(eq(leads.email, e));
  } catch (err) {
    console.error("markLeadConverted failed:", err);
  }
}
