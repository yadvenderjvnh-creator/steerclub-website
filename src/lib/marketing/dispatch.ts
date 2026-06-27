import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { campaigns, campaignRecipients } from "@/lib/db/schema";
import { resolveSegment } from "./segments";
import { sendEmail } from "@/lib/email";

function renderBody(body: string, name: string | null) {
  return body.replace(/\{\{\s*name\s*\}\}/gi, name || "there");
}

/** Send one campaign (email channel). Used by the admin action + the cron. */
export async function dispatchCampaign(id: string): Promise<{ sent: number; failed: number; recipients: number }> {
  const [c] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  if (!c || c.status === "sent") return { sent: 0, failed: 0, recipients: 0 };
  if (c.channel !== "email") {
    await db.update(campaigns).set({ status: "sent", sentAt: new Date(), stats: { recipients: 0, sent: 0, failed: 0 } }).where(eq(campaigns.id, id));
    return { sent: 0, failed: 0, recipients: 0 };
  }
  await db.update(campaigns).set({ status: "sending" }).where(eq(campaigns.id, id));
  const recipients = await resolveSegment(c.segment);
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const ok = await sendEmail({ to: r.email, subject: c.subject ?? "SteerClub", html: renderBody(c.body, r.name) });
    await db.insert(campaignRecipients).values({ campaignId: id, userId: r.userId ?? null, email: r.email, status: ok ? "sent" : "failed", sentAt: ok ? new Date() : null });
    ok ? sent++ : failed++;
  }
  await db.update(campaigns).set({ status: "sent", sentAt: new Date(), stats: { recipients: recipients.length, sent, failed } }).where(eq(campaigns.id, id));
  return { sent, failed, recipients: recipients.length };
}

/** Send all scheduled campaigns whose time has come. Cron entry point. */
export async function dispatchDueCampaigns(): Promise<number> {
  const due = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.status, "scheduled"), lte(campaigns.scheduledAt, new Date())));
  let count = 0;
  for (const c of due) {
    await dispatchCampaign(c.id);
    count++;
  }
  return count;
}
