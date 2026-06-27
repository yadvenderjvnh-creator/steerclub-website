import { verifyCalendarToken } from "@/lib/portal/calendar";
import { getUserSessions, getUpcomingEvents } from "@/lib/portal/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cleanToken = token.replace(/\.ics$/, "");
  const userId = verifyCalendarToken(cleanToken);
  if (!userId) return new Response("Invalid calendar token.", { status: 401 });

  const [sessions, events] = await Promise.all([
    getUserSessions({ id: userId, email: "" }),
    getUpcomingEvents(),
  ]);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SteerClub//Portal//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:SteerClub",
  ];

  for (const s of sessions) {
    const start = new Date(s.scheduledAt);
    const end = new Date(start.getTime() + 120 * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:session-${s.id}@steerclub.in`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(`${s.programName} — Session ${s.sessionNo}`)}`,
      `LOCATION:${esc(s.location ?? s.city)}`,
      "END:VEVENT"
    );
  }

  for (const e of events) {
    const start = new Date(e.eventDate);
    const end = new Date(start.getTime() + 120 * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:event-${e.id}@steerclub.in`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${esc(`SteerClub: ${e.title}`)}`,
      `LOCATION:${esc(e.location)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="steerclub.ics"',
    },
  });
}
