import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sessions, users, rolePermissions } from "@/lib/db/schema";
import { SESSION_COOKIE } from "./constants";
import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSION_KEYS } from "./permissions";

export { SESSION_COOKIE };
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type UserRole = "client" | "parent" | "coach" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  city: string | null;
  image: string | null;
};

/** Create a DB-backed session for a user and set the httpOnly session cookie. */
export async function createSession(userId: string): Promise<void> {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ sessionToken, userId, expires });
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Resolve the current session user from the cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      city: users.city,
      image: users.image,
      expires: sessions.expires,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.sessionToken, token))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.expires.getTime() < Date.now()) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    city: row.city,
    image: row.image,
  };
}

/** Require any authenticated user; redirects to sign-in otherwise. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Require a user whose role is in `roles`; redirects otherwise. */
export async function requireRole(
  roles: UserRole[],
  next?: string
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (!roles.includes(user.role)) {
    // Route a role mismatch somewhere sensible for that role.
    redirect(user.role === "coach" ? "/admin/coach" : "/dashboard");
  }
  return user;
}

// ---------- Granular RBAC (Phase 6.4) ----------

/** Founder/ops allowlist — bypasses all permission checks. */
export function isSuperAdmin(email: string): boolean {
  const allow = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allow.includes(email.toLowerCase());
}

/** Effective permission keys for a user. Super-admins get all; otherwise role grants (DB, else defaults). */
export async function getUserPermissions(user: SessionUser): Promise<Set<string>> {
  if (isSuperAdmin(user.email)) return new Set(ALL_PERMISSION_KEYS);
  const rows = await db.select({ key: rolePermissions.permissionKey }).from(rolePermissions).where(eq(rolePermissions.role, user.role));
  if (rows.length === 0) return new Set(DEFAULT_ROLE_PERMISSIONS[user.role] ?? []);
  return new Set(rows.map((r) => r.key));
}

export async function checkPermission(user: SessionUser, key: string): Promise<boolean> {
  if (isSuperAdmin(user.email)) return true;
  const perms = await getUserPermissions(user);
  return perms.has(key);
}

/** Require a specific permission; redirects if missing. Returns the user. */
export async function requirePermission(key: string, next?: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  if (!(await checkPermission(user, key))) {
    redirect(user.role === "coach" ? "/admin/coach" : user.role === "admin" ? "/admin" : "/dashboard");
  }
  return user;
}

/** Delete the current session (DB row + cookie). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.sessionToken, token));
    store.delete(SESSION_COOKIE);
  }
}
