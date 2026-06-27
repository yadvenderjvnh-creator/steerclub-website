import { and, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { assessmentBookings, programBookings, steerScores } from "@/lib/db/schema";

/**
 * Link a user's pre-account data (bookings + scores captured by email/guestEmail)
 * to their userId on login. Idempotent; only fills rows where userId is null.
 */
export async function reconcileUserData(userId: string, email: string): Promise<void> {
  const e = email.toLowerCase().trim();
  try {
    await db
      .update(assessmentBookings)
      .set({ userId })
      .where(and(isNull(assessmentBookings.userId), sql`lower(${assessmentBookings.email}) = ${e}`));
    await db
      .update(programBookings)
      .set({ userId })
      .where(and(isNull(programBookings.userId), sql`lower(${programBookings.email}) = ${e}`));
    await db
      .update(steerScores)
      .set({ userId })
      .where(and(isNull(steerScores.userId), sql`lower(${steerScores.guestEmail}) = ${e}`));
  } catch (err) {
    console.error("reconcileUserData failed:", err);
  }
}
