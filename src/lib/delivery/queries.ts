import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";

/** Resolve the instructor row for a logged-in coach (by their user id). */
export async function getInstructorByUser(userId: string) {
  const rows = await db
    .select()
    .from(instructors)
    .where(eq(instructors.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCoachInstructorId(userId: string): Promise<string | null> {
  const i = await getInstructorByUser(userId);
  return i?.id ?? null;
}
