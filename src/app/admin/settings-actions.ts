"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orgSettings, notificationTemplates, apiKeys, users, activityLog, rolePermissions, branches } from "@/lib/db/schema";
import { createApiKey } from "@/lib/api-keys";

type Role = "client" | "parent" | "coach" | "admin";
type City = "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai";

async function audit(actorId: string, action: string, entity: string, entityId: string) {
  await db.insert(activityLog).values({ actorId, action, entity, entityId });
}

// ---------- Roles & permissions ----------
export async function setRolePermission(role: Role, permissionKey: string, allow: boolean) {
  const admin = await requirePermission("settings.manage");
  if (allow) {
    await db.insert(rolePermissions).values({ role, permissionKey }).onConflictDoNothing();
  } else {
    await db.delete(rolePermissions).where(and(eq(rolePermissions.role, role), eq(rolePermissions.permissionKey, permissionKey)));
  }
  await audit(admin.id, "settings.permission.set", "role_permission", `${role}:${permissionKey}:${allow}`);
  revalidatePath("/admin/settings");
}

// ---------- Branches ----------
export async function createBranch(city: City, name: string) {
  const admin = await requirePermission("settings.manage");
  await db.insert(branches).values({ city, name });
  await audit(admin.id, "settings.branch.create", "branch", `${city}:${name}`);
  revalidatePath("/admin/settings");
}

export async function toggleBranch(id: string, isActive: boolean) {
  const admin = await requirePermission("settings.manage");
  await db.update(branches).set({ isActive }).where(eq(branches.id, id));
  await audit(admin.id, "settings.branch.toggle", "branch", id);
  revalidatePath("/admin/settings");
}

// ---------- Branding & tax ----------
export async function saveOrgSettings(input: {
  legalName?: string; gstin?: string; gstRate?: number; hsn?: string; supportEmail?: string; brandLogoUrl?: string;
}) {
  const admin = await requirePermission("settings.manage");
  const values = {
    legalName: input.legalName || null,
    gstin: input.gstin || null,
    gstRate: input.gstRate ?? null,
    hsn: input.hsn || null,
    supportEmail: input.supportEmail || null,
    brandLogoUrl: input.brandLogoUrl || null,
    updatedAt: new Date(),
  };
  const [existing] = await db.select({ id: orgSettings.id }).from(orgSettings).limit(1);
  if (existing) await db.update(orgSettings).set(values).where(eq(orgSettings.id, existing.id));
  else await db.insert(orgSettings).values(values);
  await audit(admin.id, "settings.org.save", "org_settings", existing?.id ?? "new");
  revalidatePath("/admin/settings");
}

// ---------- Team ----------
export async function inviteAdmin(input: { email: string; name?: string }): Promise<{ ok: boolean; error?: string }> {
  const admin = await requirePermission("settings.manage");
  const email = input.email.toLowerCase().trim();
  if (!email) return { ok: false, error: "Email required." };
  const [existing] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    if (existing.role !== "admin") await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
  } else {
    await db.insert(users).values({ email, name: input.name || email.split("@")[0], role: "admin" });
  }
  await audit(admin.id, "settings.admin.invite", "user", email);
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function setUserRole(userId: string, role: "client" | "coach" | "admin") {
  const admin = await requirePermission("settings.manage");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await audit(admin.id, "settings.role.set", "user", userId);
  revalidatePath("/admin/settings");
}

// ---------- Templates ----------
export async function upsertTemplate(input: { key: string; subject?: string; body: string }) {
  const admin = await requirePermission("settings.manage");
  const [existing] = await db.select({ id: notificationTemplates.id }).from(notificationTemplates).where(eq(notificationTemplates.key, input.key)).limit(1);
  const values = { key: input.key, subject: input.subject || null, body: input.body, updatedAt: new Date() };
  if (existing) await db.update(notificationTemplates).set(values).where(eq(notificationTemplates.id, existing.id));
  else await db.insert(notificationTemplates).values(values);
  await audit(admin.id, "settings.template.save", "notification_template", input.key);
  revalidatePath("/admin/settings");
}

// ---------- API keys ----------
export async function createApiKeyAction(name: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  const admin = await requirePermission("settings.manage");
  if (!name.trim()) return { ok: false, error: "Name required." };
  const { token } = await createApiKey(name.trim(), ["read"], admin.id);
  await audit(admin.id, "settings.apikey.create", "api_key", name);
  revalidatePath("/admin/settings");
  return { ok: true, token };
}

export async function revokeApiKey(id: string) {
  const admin = await requirePermission("settings.manage");
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, id));
  await audit(admin.id, "settings.apikey.revoke", "api_key", id);
  revalidatePath("/admin/settings");
}
