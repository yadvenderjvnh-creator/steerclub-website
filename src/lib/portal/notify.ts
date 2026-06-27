import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, notifications } from "@/lib/db/schema";

/** Insert an in-app notification for the user with this email, if one exists. No-op otherwise. */
export async function notifyUserByEmail(
  email: string | null | undefined,
  n: { type: string; title: string; body?: string; link?: string }
): Promise<void> {
  if (!email) return;
  try {
    const u = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    if (!u[0]) return;
    await db.insert(notifications).values({
      userId: u[0].id,
      type: n.type,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
    });
  } catch (err) {
    console.error("notifyUserByEmail failed:", err);
  }
}
