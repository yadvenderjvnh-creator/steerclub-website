// Catalog of granular permission keys (the grants live in the role_permissions table).
export type Permission = { key: string; module: string; label: string };

export const PERMISSIONS: Permission[] = [
  { key: "leads.write", module: "Leads", label: "Manage leads" },
  { key: "bookings.write", module: "Bookings", label: "Manage bookings" },
  { key: "students.read", module: "Students", label: "View students" },
  { key: "assessments.write", module: "Assessments", label: "Record assessments" },
  { key: "programs.write", module: "Delivery", label: "Manage programs & cohorts" },
  { key: "coaches.write", module: "Delivery", label: "Manage coaches" },
  { key: "community.write", module: "Community", label: "Manage events & content" },
  { key: "payments.read", module: "Finance", label: "View payments" },
  { key: "payments.refund", module: "Finance", label: "Issue refunds" },
  { key: "marketing.write", module: "Marketing", label: "Run campaigns & coupons" },
  { key: "reports.read", module: "Analytics", label: "View reports" },
  { key: "content.write", module: "Content", label: "Edit site content" },
  { key: "settings.manage", module: "Governance", label: "Manage settings & team" },
];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

/** Defaults used when a role has no rows yet in role_permissions (pre-seed safety). */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSION_KEYS,
  coach: [],
  parent: [],
  client: [],
};
