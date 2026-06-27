import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { consumeLoginToken } from "@/lib/auth/tokens";
import { createSession, type UserRole } from "@/lib/auth/session";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Consumes a magic-link token, creates/links the user + session, redirects by role. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const next = url.searchParams.get("next");
  const origin = url.origin;

  const email = await consumeLoginToken(token);
  if (!email) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid-link`);
  }

  const isAdmin = adminEmails().includes(email.toLowerCase());

  // Find or create the user.
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  let userId: string;
  let role: UserRole;

  if (existing[0]) {
    role = isAdmin && existing[0].role !== "admin" ? "admin" : existing[0].role;
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), emailVerified: existing[0].emailVerified ?? new Date(), role })
      .where(eq(users.id, existing[0].id));
    userId = existing[0].id;
  } else {
    role = isAdmin ? "admin" : "client";
    const inserted = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name: email.split("@")[0],
        role,
        emailVerified: new Date(),
        lastLoginAt: new Date(),
      })
      .returning({ id: users.id });
    userId = inserted[0].id;
  }

  await createSession(userId);

  // Safe redirect: only allow same-site relative paths from `next`.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const dest = safeNext ?? (role === "admin" || role === "coach" ? "/admin" : "/dashboard");
  return NextResponse.redirect(`${origin}${dest}`);
}
