import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parentLinks, users } from "@/lib/db/schema";

export type LinkedStudent = { studentId: string; name: string; email: string; relationship: string | null };
export type LinkedParent = { parentId: string; name: string; email: string; relationship: string | null };

/** Students a parent can view. */
export async function getLinkedStudents(parentUserId: string): Promise<LinkedStudent[]> {
  return db
    .select({ studentId: users.id, name: users.name, email: users.email, relationship: parentLinks.relationship })
    .from(parentLinks)
    .innerJoin(users, eq(parentLinks.studentUserId, users.id))
    .where(and(eq(parentLinks.parentUserId, parentUserId), eq(parentLinks.approved, true)));
}

/** Parents linked to a student (for the student's own management view). */
export async function getLinkedParents(studentUserId: string): Promise<LinkedParent[]> {
  return db
    .select({ parentId: users.id, name: users.name, email: users.email, relationship: parentLinks.relationship })
    .from(parentLinks)
    .innerJoin(users, eq(parentLinks.parentUserId, users.id))
    .where(eq(parentLinks.studentUserId, studentUserId));
}

/** True if this parent is allowed to view this student. */
export async function assertParentAccess(parentUserId: string, studentUserId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: parentLinks.id })
    .from(parentLinks)
    .where(and(eq(parentLinks.parentUserId, parentUserId), eq(parentLinks.studentUserId, studentUserId), eq(parentLinks.approved, true)))
    .limit(1);
  return Boolean(row);
}

/** Resolve a student's {id,email} for reuse with the portal queries. */
export async function getStudentUser(studentUserId: string) {
  const [u] = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.id, studentUserId)).limit(1);
  return u ?? null;
}
