import { and, desc, eq, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, users } from "@/lib/db/schema";
import { getGstBreakup } from "./config";

/** Next sequential invoice number for the current FY-ish year: SC/2026/00001. */
async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SC/${year}/`;
  const [r] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(invoices)
    .where(like(invoices.number, `${prefix}%`));
  const seq = (r?.c ?? 0) + 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

/**
 * Ensure exactly one invoice exists for a confirmed booking. Idempotent via the
 * unique(source, bookingId) constraint. Returns the invoice id (or null on failure).
 */
export async function ensureInvoice(input: {
  source: string;
  bookingId: string;
  email?: string | null;
  userId?: string | null;
  item: string;
  amount: number; // paise (GST-inclusive total)
}): Promise<string | null> {
  if (input.amount <= 0) return null;
  try {
    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.source, input.source), eq(invoices.bookingId, input.bookingId)))
      .limit(1);
    if (existing) return existing.id;

    // Resolve userId from email when not provided.
    let userId = input.userId ?? null;
    if (!userId && input.email) {
      const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email.toLowerCase().trim())).limit(1);
      userId = u?.id ?? null;
    }

    const breakup = await getGstBreakup(input.amount);
    // Retry a couple of times on number collisions (low volume, no sequence table).
    for (let attempt = 0; attempt < 4; attempt++) {
      const number = await nextInvoiceNumber();
      try {
        const [row] = await db
          .insert(invoices)
          .values({
            number,
            source: input.source,
            bookingId: input.bookingId,
            userId,
            email: input.email ?? null,
            lineItem: input.item,
            subtotal: breakup ? breakup.taxable : input.amount,
            gstBreakup: breakup,
            total: input.amount,
            status: "issued",
          })
          .returning({ id: invoices.id });
        return row.id;
      } catch (err) {
        // Unique(source,bookingId) → another path already created it.
        const [again] = await db
          .select({ id: invoices.id })
          .from(invoices)
          .where(and(eq(invoices.source, input.source), eq(invoices.bookingId, input.bookingId)))
          .limit(1);
        if (again) return again.id;
        // else likely a number collision — loop retries with a fresh number.
        if (attempt === 3) throw err;
      }
    }
    return null;
  } catch (err) {
    console.error("ensureInvoice failed:", err);
    return null;
  }
}

/** Invoices belonging to a user (by userId or email), newest first. */
export async function getUserInvoices(userId: string, email: string) {
  return db
    .select()
    .from(invoices)
    .where(sql`${invoices.userId} = ${userId} OR lower(${invoices.email}) = ${email.toLowerCase().trim()}`)
    .orderBy(desc(invoices.issuedAt));
}

export async function getInvoiceById(id: string) {
  const [row] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return row ?? null;
}

/** All invoices (admin), optional date range. */
export async function getAllInvoices() {
  return db.select().from(invoices).orderBy(desc(invoices.issuedAt));
}
