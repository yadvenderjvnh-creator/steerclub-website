import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { automationLog, assessmentBookings, programBookings, memberships, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { notifyUserByEmail } from "@/lib/portal/notify";

/** Insert an automation marker; returns true only the first time (idempotency). */
async function once(type: string, refId: string): Promise<boolean> {
  const r = await db.insert(automationLog).values({ type, refId }).onConflictDoNothing().returning({ id: automationLog.id });
  return r.length > 0;
}

/** Run lifecycle automations (recovery, review, win-back). Idempotent via automationLog. Returns counts. */
export async function runLifecycleAutomations(): Promise<{ recovery: number; review: number; winback: number }> {
  const now = Date.now();
  const h24 = new Date(now - 24 * 3600 * 1000);
  const h72 = new Date(now - 72 * 3600 * 1000);
  const d30 = new Date(now - 30 * 86400 * 1000);

  let recovery = 0;
  let review = 0;
  let winback = 0;

  // 1) Abandoned-booking recovery — pending 24–72h.
  const pendAsmt = await db
    .select({ id: assessmentBookings.id, name: assessmentBookings.name, email: assessmentBookings.email })
    .from(assessmentBookings)
    .where(and(eq(assessmentBookings.status, "pending"), lt(assessmentBookings.createdAt, h24), gt(assessmentBookings.createdAt, h72)));
  const pendProg = await db
    .select({ id: programBookings.id, name: programBookings.name, email: programBookings.email })
    .from(programBookings)
    .where(and(eq(programBookings.status, "pending"), lt(programBookings.createdAt, h24), gt(programBookings.createdAt, h72)));

  for (const b of [...pendAsmt, ...pendProg]) {
    if (!b.email) continue;
    if (!(await once("recovery", b.id))) continue;
    await sendEmail({
      to: b.email,
      subject: "Still want to take the road?",
      html: `<p>Hi ${b.name ?? "there"},</p><p>You started a SteerClub booking but didn't finish checkout. Your spot is still open — pick up where you left off whenever you're ready.</p><p><a href="https://steerclub.in/score/book">Complete your booking →</a></p><p>Earn the Road. — SteerClub</p>`,
    });
    await notifyUserByEmail(b.email, { type: "recovery", title: "Finish your booking", body: "Your SteerClub booking is waiting.", link: "/score/book" });
    recovery++;
  }

  // 2) Post-program review request — completed programs.
  const completed = await db
    .select({ id: programBookings.id, name: programBookings.name, email: programBookings.email })
    .from(programBookings)
    .where(eq(programBookings.status, "completed"));
  for (const b of completed) {
    if (!b.email) continue;
    if (!(await once("review", b.id))) continue;
    await sendEmail({
      to: b.email,
      subject: "How was your SteerClub program?",
      html: `<p>Hi ${b.name ?? "there"},</p><p>Congratulations on completing your program! We'd love your feedback — it helps other drivers decide to take the road.</p><p>Just reply to this email with a line or two. Thank you.</p><p>— SteerClub</p>`,
    });
    review++;
  }

  // 3) Membership win-back — expired in the last 30 days.
  const lapsed = await db
    .select({ id: memberships.id, email: users.email, name: users.name })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(and(lt(memberships.endDate, new Date()), gt(memberships.endDate, d30)));
  for (const m of lapsed) {
    if (!m.email) continue;
    if (!(await once("winback", m.id))) continue;
    await sendEmail({
      to: m.email,
      subject: "Your SteerClub membership lapsed — come back to the road",
      html: `<p>Hi ${m.name ?? "there"},</p><p>Your SteerClub membership recently expired. Renew to keep member pricing on every program and first access to events.</p><p><a href="https://steerclub.in/membership">Renew membership →</a></p><p>— SteerClub</p>`,
    });
    winback++;
  }

  return { recovery, review, winback };
}
