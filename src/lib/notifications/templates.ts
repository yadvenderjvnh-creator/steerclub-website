import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationTemplates } from "@/lib/db/schema";

/** Code defaults — used when no DB template overrides the key. */
export const TEMPLATE_DEFAULTS: Record<string, { subject: string; body: string }> = {
  event_rsvp: {
    subject: "RSVP confirmed — {{title}}",
    body: "<p>Hi {{name}},</p><p>You're registered for <strong>{{title}}</strong> on {{when}} at {{location}}.</p><p>See you there. Earn the Road.<br/>— SteerClub</p>",
  },
  booking_confirmed: {
    subject: "Payment received — SteerClub",
    body: "<p>Hi {{name}},</p><p>Your payment is confirmed. Check your dashboard for details.</p><p>— SteerClub</p>",
  },
};

function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? "");
}

/** Render a template (DB override → code default) with {{var}} substitution. */
export async function renderTemplate(
  key: string,
  vars: Record<string, string>
): Promise<{ subject: string; html: string } | null> {
  let subject = TEMPLATE_DEFAULTS[key]?.subject ?? "";
  let body = TEMPLATE_DEFAULTS[key]?.body ?? "";
  try {
    const [row] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.key, key)).limit(1);
    if (row) {
      subject = row.subject ?? subject;
      body = row.body;
    }
  } catch {
    /* fall back to defaults */
  }
  if (!body) return null;
  return { subject: fill(subject, vars), html: fill(body, vars) };
}
