"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser, requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { parentLinks, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";

/** Find-or-create a parent user for an email (don't downgrade admins/coaches). */
async function findOrCreateParent(email: string, name?: string): Promise<string> {
  const e = email.toLowerCase().trim();
  const [existing] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, e)).limit(1);
  if (existing) {
    if (existing.role === "client") await db.update(users).set({ role: "parent" }).where(eq(users.id, existing.id));
    return existing.id;
  }
  const [created] = await db.insert(users).values({ email: e, name: name || e.split("@")[0], role: "parent" }).returning({ id: users.id });
  return created.id;
}

/** A student invites a parent to view their progress (read-only). */
export async function inviteParent(input: { email: string; name?: string; relationship?: string }): Promise<{ ok: boolean; error?: string }> {
  const student = await requireUser();
  const email = input.email.toLowerCase().trim();
  if (!email) return { ok: false, error: "Email required." };
  if (email === student.email.toLowerCase()) return { ok: false, error: "You can't add yourself." };

  const parentId = await findOrCreateParent(email, input.name);
  await db
    .insert(parentLinks)
    .values({ parentUserId: parentId, studentUserId: student.id, relationship: input.relationship || null, invitedByUserId: student.id, approved: true })
    .onConflictDoNothing();

  await sendEmail({
    to: email,
    subject: `${student.name} added you on SteerClub`,
    html: `<p>Hi,</p><p>${student.name} has invited you to follow their driving progress on SteerClub — score, sessions, attendance and payments, read-only.</p><p><a href="https://steerclub.in/sign-in">Sign in with this email</a> to view their family dashboard.</p><p>— SteerClub</p>`,
  });

  revalidatePath("/dashboard/family");
  return { ok: true };
}

/** A student removes a linked parent. */
export async function revokeParentLink(parentUserId: string): Promise<void> {
  const student = await requireUser();
  await db.delete(parentLinks).where(and(eq(parentLinks.parentUserId, parentUserId), eq(parentLinks.studentUserId, student.id)));
  revalidatePath("/dashboard/family");
}

/** Admin links a parent to a student. */
export async function adminLinkParent(input: { studentUserId: string; parentEmail: string; relationship?: string }): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["admin"]);
  const email = input.parentEmail.toLowerCase().trim();
  if (!email) return { ok: false, error: "Parent email required." };
  const parentId = await findOrCreateParent(email);
  await db
    .insert(parentLinks)
    .values({ parentUserId: parentId, studentUserId: input.studentUserId, relationship: input.relationship || null, approved: true })
    .onConflictDoNothing();
  revalidatePath("/admin/students");
  return { ok: true };
}
