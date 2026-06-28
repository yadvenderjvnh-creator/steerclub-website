import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, branches } from "@/lib/db/schema";
import { isSuperAdmin } from "./session";

/**
 * The city a staff member is scoped to, or null for HQ/super-admin (sees everything).
 * Apply the returned city as a `where` filter on branch-scoped admin list queries.
 */
export async function branchScopeCity(user: { id: string; email: string }): Promise<string | null> {
  if (isSuperAdmin(user.email)) return null;
  const [u] = await db.select({ branchId: users.branchId }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!u?.branchId) return null;
  const [b] = await db.select({ city: branches.city }).from(branches).where(eq(branches.id, u.branchId)).limit(1);
  return b?.city ?? null;
}
