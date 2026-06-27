import { and, eq, isNull, gte, lte, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { programSessions, cohorts, programs, programBookings, instructors, events, eventRegistrations, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { notifyUserByEmail } from "@/lib/portal/notify";
import { dispatchDueCampaigns } from "@/lib/marketing/dispatch";
import { runLifecycleAutomations } from "@/lib/marketing/automations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Daily cron: email + notify students & coaches about sessions in the next ~24h. Idempotent via reminderSentAt. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 36 * 3600 * 1000);

  const sessions = await db
    .select({
      id: programSessions.id,
      sessionNo: programSessions.sessionNo,
      scheduledAt: programSessions.scheduledAt,
      cohortId: programSessions.cohortId,
      location: programSessions.location,
      programName: programs.name,
      city: cohorts.city,
      coachEmail: instructors.email,
      coachName: instructors.name,
    })
    .from(programSessions)
    .innerJoin(cohorts, eq(programSessions.cohortId, cohorts.id))
    .innerJoin(programs, eq(cohorts.programId, programs.id))
    .leftJoin(instructors, eq(programSessions.instructorId, instructors.id))
    .where(
      and(
        eq(programSessions.status, "scheduled"),
        isNull(programSessions.reminderSentAt),
        gte(programSessions.scheduledAt, now),
        lte(programSessions.scheduledAt, horizon)
      )
    );

  let emails = 0;
  for (const s of sessions) {
    const when = new Date(s.scheduledAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const where = s.location ?? s.city;

    const enrollees = await db
      .select({ name: programBookings.name, email: programBookings.email })
      .from(programBookings)
      .where(and(eq(programBookings.cohortId, s.cohortId), ne(programBookings.status, "cancelled")));

    const studentHtml = `<p>Reminder: your <b>${s.programName}</b> session ${s.sessionNo} is coming up.</p><p><b>When:</b> ${when}<br/><b>Where:</b> ${where}</p><p>Earn the Road. — SteerClub</p>`;

    for (const e of enrollees) {
      if (!e.email) continue;
      await sendEmail({ to: e.email, subject: `SteerClub session reminder — ${when}`, html: studentHtml });
      await notifyUserByEmail(e.email, {
        type: "session",
        title: `Upcoming session: ${s.programName}`,
        body: `Session ${s.sessionNo} on ${when} · ${where}`,
        link: "/dashboard/calendar",
      });
      emails += 1;
    }

    if (s.coachEmail) {
      const coachHtml = `<p>Reminder: you have a <b>${s.programName}</b> session ${s.sessionNo}.</p><p><b>When:</b> ${when}<br/><b>Where:</b> ${where}</p><p>— SteerClub</p>`;
      await sendEmail({ to: s.coachEmail, subject: `Coaching session reminder — ${when}`, html: coachHtml });
      emails += 1;
    }

    await db.update(programSessions).set({ reminderSentAt: now }).where(eq(programSessions.id, s.id));
  }

  // ---- Event reminders (T-24h, per confirmed registration, idempotent) ----
  const eventRegs = await db
    .select({
      regId: eventRegistrations.id,
      name: users.name,
      email: users.email,
      title: events.title,
      eventDate: events.eventDate,
      location: events.location,
      city: events.city,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(eventRegistrations.eventId, events.id))
    .innerJoin(users, eq(eventRegistrations.userId, users.id))
    .where(
      and(
        eq(eventRegistrations.status, "confirmed"),
        isNull(eventRegistrations.reminderSentAt),
        gte(events.eventDate, now),
        lte(events.eventDate, horizon)
      )
    );

  let eventEmails = 0;
  for (const r of eventRegs) {
    const when = new Date(r.eventDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const where = r.location ?? r.city;
    await sendEmail({
      to: r.email,
      subject: `Reminder — ${r.title} on ${when}`,
      html: `<p>Hi ${r.name},</p><p>Your SteerClub event <b>${r.title}</b> is coming up.</p><p><b>When:</b> ${when}<br/><b>Where:</b> ${where}</p><p>See you there. Earn the Road. — SteerClub</p>`,
    });
    await notifyUserByEmail(r.email, {
      type: "event",
      title: `Tomorrow: ${r.title}`,
      body: `${when} · ${where}`,
      link: "/dashboard/community",
    });
    await db.update(eventRegistrations).set({ reminderSentAt: now }).where(eq(eventRegistrations.id, r.regId));
    eventEmails += 1;
  }

  // ---- Marketing: dispatch due campaigns + lifecycle automations ----
  const campaignsSent = await dispatchDueCampaigns();
  const lifecycle = await runLifecycleAutomations();

  return Response.json({
    ok: true,
    sessions: sessions.length,
    emails,
    events: eventRegs.length,
    eventEmails,
    campaignsSent,
    lifecycle,
  });
}
