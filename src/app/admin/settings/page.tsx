import { desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orgSettings, notificationTemplates, apiKeys, users, activityLog, rolePermissions, branches } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { TEMPLATE_DEFAULTS } from "@/lib/notifications/templates";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { SettingsManager, type AuditRow, type TeamRow, type TemplateRow, type ApiKeyRow, type OrgSettings, type BranchRow } from "./settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("settings.manage");

  const [org, templates, keys, team, audit, grants, branchRows] = await Promise.all([
    db.select().from(orgSettings).limit(1),
    db.select().from(notificationTemplates),
    db.select().from(apiKeys).where(isNull(apiKeys.revokedAt)).orderBy(desc(apiKeys.createdAt)),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users).where(inArray(users.role, ["admin", "coach"])).orderBy(users.name),
    db
      .select({ id: activityLog.id, action: activityLog.action, entity: activityLog.entity, entityId: activityLog.entityId, createdAt: activityLog.createdAt, actorName: users.name })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.actorId, users.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(300),
    db.select().from(rolePermissions),
    db.select().from(branches).orderBy(branches.city),
  ]);

  const grantSet = new Set(grants.map((g) => `${g.role}:${g.permissionKey}`));
  const branchData: BranchRow[] = branchRows.map((b) => ({ id: b.id, city: b.city, name: b.name, isActive: b.isActive }));

  const orgRow: OrgSettings = {
    legalName: org[0]?.legalName ?? "",
    gstin: org[0]?.gstin ?? "",
    gstRate: org[0]?.gstRate ?? 18,
    hsn: org[0]?.hsn ?? "",
    supportEmail: org[0]?.supportEmail ?? "",
    brandLogoUrl: org[0]?.brandLogoUrl ?? "",
  };

  const dbTplByKey = new Map(templates.map((t) => [t.key, t]));
  const templateRows: TemplateRow[] = Object.entries(TEMPLATE_DEFAULTS).map(([key, def]) => {
    const o = dbTplByKey.get(key);
    return { key, subject: o?.subject ?? def.subject, body: o?.body ?? def.body, overridden: Boolean(o) };
  });

  const auditRows: AuditRow[] = audit.map((a) => ({ id: a.id, action: a.action, entity: a.entity, entityId: a.entityId, actorName: a.actorName, createdAt: a.createdAt.toISOString() }));
  const teamRows: TeamRow[] = team.map((t) => ({ id: t.id, name: t.name, email: t.email, role: t.role }));
  const keyRows: ApiKeyRow[] = keys.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null, createdAt: k.createdAt.toISOString() }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Governance</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Settings</h1>
        <p className="text-steel text-sm font-ui mt-1">Audit log, team, branding & tax, templates, API keys.</p>
      </div>
      <SettingsManager
        org={orgRow}
        templates={templateRows}
        apiKeysList={keyRows}
        team={teamRows}
        audit={auditRows}
        permissions={PERMISSIONS}
        grants={[...grantSet]}
        branches={branchData}
      />
    </div>
  );
}
