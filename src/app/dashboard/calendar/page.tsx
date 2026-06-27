import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserSessions, getUpcomingEvents } from "@/lib/portal/queries";
import { calendarToken } from "@/lib/portal/calendar";

export const metadata: Metadata = { title: "Calendar — Dashboard" };
export const dynamic = "force-dynamic";

type Item = { date: string; title: string; sub: string; kind: "session" | "event"; past: boolean };

export default async function CalendarPage() {
  const user = await requireUser();
  const [sessions, events] = await Promise.all([getUserSessions(user), getUpcomingEvents()]);
  const now = Date.now();

  const items: Item[] = [
    ...sessions.map((s) => ({
      date: new Date(s.scheduledAt).toISOString(),
      title: `${s.programName} — Session ${s.sessionNo}`,
      sub: s.location ?? s.city,
      kind: "session" as const,
      past: new Date(s.scheduledAt).getTime() < now,
    })),
    ...events.map((e) => ({
      date: e.eventDate.toISOString(),
      title: e.title,
      sub: `${e.location} · ${e.city}`,
      kind: "event" as const,
      past: false,
    })),
  ].sort((a, b) => (a.date < b.date ? -1 : 1));

  const upcoming = items.filter((i) => !i.past);
  const past = items.filter((i) => i.past).reverse();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://steerclub.in";
  const feedUrl = `${base}/api/calendar/${calendarToken(user.id)}.ics`;
  const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Calendar</h1>
        <p className="text-steel text-sm font-ui mt-1">Your sessions and SteerClub events</p>
      </div>

      <div>
        <h2 className="font-heading font-black text-sm text-lime uppercase tracking-widest mb-4">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-steel font-ui text-sm">Nothing scheduled yet.</div>
        ) : (
          <div className="glass rounded-xl divide-y divide-white/5">
            {upcoming.map((i, idx) => (
              <CalRow key={idx} item={i} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-heading font-black text-sm text-steel uppercase tracking-widest mb-4">Past Sessions</h2>
          <div className="glass rounded-xl divide-y divide-white/5 opacity-70">
            {past.slice(0, 10).map((i, idx) => (
              <CalRow key={idx} item={i} />
            ))}
          </div>
        </div>
      )}

      {/* Subscribe */}
      <div className="rounded-2xl border border-lime/20 p-6">
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-2">Sync to your calendar</h2>
        <p className="text-white/50 font-body text-sm mb-4">
          Subscribe to keep your sessions and events in Google Calendar / Apple Calendar automatically.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 py-2.5 rounded hover:bg-lime/90">
            Add to Google Calendar
          </a>
          <code className="text-xs text-steel font-mono break-all bg-graphite px-3 py-2 rounded border border-white/10 flex-1 min-w-[200px]">{feedUrl}</code>
        </div>
      </div>
    </div>
  );
}

function CalRow({ item }: { item: Item }) {
  const d = new Date(item.date);
  return (
    <div className="p-4 flex items-center gap-4">
      <div className="w-12 text-center shrink-0">
        <p className="font-heading font-black text-white text-lg leading-none">{d.toLocaleDateString("en-IN", { day: "2-digit" })}</p>
        <p className="text-[10px] text-steel font-ui uppercase">{d.toLocaleDateString("en-IN", { month: "short" })}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-ui text-sm">{item.title}</p>
        <p className="text-xs text-steel font-ui flex items-center gap-1.5 mt-0.5">
          <MapPin className="w-3 h-3" /> {item.sub} · {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <span className={`text-[10px] font-ui uppercase tracking-widest shrink-0 ${item.kind === "session" ? "text-lime" : "text-white/50"}`}>
        {item.kind}
      </span>
    </div>
  );
}
