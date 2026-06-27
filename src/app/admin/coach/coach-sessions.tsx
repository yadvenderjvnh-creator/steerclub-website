"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { markAttendance, saveFeedback, markSessionComplete } from "../delivery-actions";

export type RosterRow = { name: string; userId: string };
export type CoachSessionRow = {
  id: string;
  label: string;
  city: string;
  scheduledAt: string;
  status: string;
  roster: RosterRow[];
};

const ATT = ["present", "absent", "late", "excused"];
const selCls = "bg-graphite border border-white/10 rounded px-2 py-1 text-xs text-white font-ui capitalize focus:outline-none focus:border-lime/50";

export function CoachSessions({
  sessions,
  attendanceMap,
  feedbackMap,
}: {
  sessions: CoachSessionRow[];
  attendanceMap: Record<string, string>;
  feedbackMap: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState<string | null>(sessions.find((s) => s.status !== "completed")?.id ?? sessions[0]?.id ?? null);
  const run = (fn: () => Promise<void>) => startTransition(async () => { await fn(); router.refresh(); });

  if (sessions.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <p className="text-white/60 font-body text-sm">No sessions assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => {
        const expanded = open === s.id;
        return (
          <div key={s.id} className="glass rounded-xl overflow-hidden">
            <button onClick={() => setOpen(expanded ? null : s.id)} className="w-full flex items-center justify-between p-4 hover:bg-white/5">
              <div className="text-left">
                <p className="text-white font-ui text-sm">{s.label}</p>
                <p className="text-xs text-steel capitalize">{s.city} · {new Date(s.scheduledAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <span className={`text-xs font-ui uppercase ${s.status === "completed" ? "text-green-400" : s.status === "cancelled" ? "text-red-300" : "text-white/50"}`}>{s.status}</span>
            </button>

            {expanded && (
              <div className="border-t border-white/10 p-4 space-y-4">
                {s.roster.length === 0 ? (
                  <p className="text-xs text-steel font-ui">No activated students in this cohort yet.</p>
                ) : (
                  s.roster.map((r) => {
                    const key = `${s.id}:${r.userId}`;
                    return (
                      <div key={r.userId} className="flex flex-col md:flex-row md:items-center gap-3">
                        <span className="text-sm text-white/80 font-ui w-40 shrink-0">{r.name}</span>
                        <select
                          defaultValue={attendanceMap[key] ?? ""}
                          onChange={(ev) => ev.target.value && run(() => markAttendance(s.id, r.userId, ev.target.value as "present"))}
                          disabled={pending}
                          className={selCls}
                        >
                          <option value="">Attendance…</option>
                          {ATT.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <input
                          defaultValue={feedbackMap[key] ?? ""}
                          onBlur={(ev) => { if (ev.target.value !== (feedbackMap[key] ?? "")) run(() => saveFeedback(s.id, r.userId, ev.target.value)); }}
                          placeholder="Feedback note…"
                          className="flex-1 bg-graphite border border-white/10 rounded px-3 py-1.5 text-sm text-white font-ui focus:outline-none focus:border-lime/50"
                        />
                      </div>
                    );
                  })
                )}
                {s.status !== "completed" && (
                  <button onClick={() => run(() => markSessionComplete(s.id))} disabled={pending} className="inline-flex items-center gap-1.5 text-xs font-ui text-lime hover:underline disabled:opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark session complete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
