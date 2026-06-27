"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  generateSessions,
  assignEnrollee,
  markAttendance,
  saveFeedback,
  markSessionComplete,
  completeProgram,
} from "../../../delivery-actions";

export type SessionRow = { id: string; sessionNo: number; scheduledAt: string; status: string; location: string | null };
export type EnrolleeRow = { id: string; name: string; email: string; userId: string | null; status: string };
export type UnassignedRow = { id: string; name: string; email: string };

const ATT = ["present", "absent", "late", "excused"];
const selCls = "bg-graphite border border-white/10 rounded px-2 py-1 text-xs text-white font-ui capitalize focus:outline-none focus:border-lime/50";

export function CohortDetail({
  cohortId,
  sessions,
  enrollees,
  unassigned,
  attendanceMap,
  feedbackMap,
}: {
  cohortId: string;
  sessions: SessionRow[];
  enrollees: EnrolleeRow[];
  unassigned: UnassignedRow[];
  attendanceMap: Record<string, string>;
  feedbackMap: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assignId, setAssignId] = useState("");
  const [openSession, setOpenSession] = useState<string | null>(sessions[0]?.id ?? null);

  const run = (fn: () => Promise<void>) => startTransition(async () => { await fn(); router.refresh(); });
  const withUser = enrollees.filter((e) => e.userId);

  return (
    <div className="space-y-8">
      {/* Enrollees */}
      <section>
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide mb-4">Enrolled Students</h2>
        {enrollees.length === 0 ? (
          <p className="text-steel font-ui text-sm">No students assigned yet.</p>
        ) : (
          <div className="glass rounded-xl divide-y divide-white/5">
            {enrollees.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white font-ui text-sm">{e.name}</p>
                  <p className="text-xs text-steel">{e.email}{!e.userId && " · not activated"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-ui uppercase capitalize text-white/60">{e.status}</span>
                  {e.status !== "completed" && (
                    <button onClick={() => run(() => completeProgram(e.id))} disabled={pending} className="text-xs font-ui text-lime hover:underline disabled:opacity-50">
                      Complete →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign unassigned enrollees */}
        {unassigned.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <select value={assignId} onChange={(e) => setAssignId(e.target.value)} className="bg-graphite border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-ui focus:outline-none focus:border-lime/50">
              <option value="">Assign a paid enrollee…</option>
              {unassigned.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button
              onClick={() => assignId && run(() => assignEnrollee(assignId, cohortId))}
              disabled={pending || !assignId}
              className="border border-white/20 text-white text-sm font-ui px-4 py-2 rounded-lg hover:border-lime/50 disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        )}
      </section>

      {/* Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Sessions</h2>
          {sessions.length === 0 && (
            <button onClick={() => run(() => generateSessions(cohortId))} disabled={pending} className="bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-lime/90 disabled:opacity-50">
              {pending ? "Generating…" : "Generate Sessions"}
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="text-steel font-ui text-sm">No sessions yet — generate them from the program schedule.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const expanded = openSession === s.id;
              return (
                <div key={s.id} className="glass rounded-xl overflow-hidden">
                  <button onClick={() => setOpenSession(expanded ? null : s.id)} className="w-full flex items-center justify-between p-4 hover:bg-white/5">
                    <div className="text-left">
                      <p className="text-white font-ui text-sm">Session {s.sessionNo}</p>
                      <p className="text-xs text-steel">{new Date(s.scheduledAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className={`text-xs font-ui uppercase ${s.status === "completed" ? "text-green-400" : s.status === "cancelled" ? "text-red-300" : "text-white/50"}`}>{s.status}</span>
                  </button>

                  {expanded && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      {withUser.length === 0 ? (
                        <p className="text-xs text-steel font-ui">No activated students to mark. Students appear here once they sign in.</p>
                      ) : (
                        withUser.map((e) => {
                          const key = `${s.id}:${e.userId}`;
                          return (
                            <div key={e.id} className="flex flex-col md:flex-row md:items-center gap-3">
                              <span className="text-sm text-white/80 font-ui w-40 shrink-0">{e.name}</span>
                              <select
                                defaultValue={attendanceMap[key] ?? ""}
                                onChange={(ev) => ev.target.value && run(() => markAttendance(s.id, e.userId!, ev.target.value as "present"))}
                                disabled={pending}
                                className={selCls}
                              >
                                <option value="">Attendance…</option>
                                {ATT.map((a) => <option key={a} value={a}>{a}</option>)}
                              </select>
                              <input
                                defaultValue={feedbackMap[key] ?? ""}
                                onBlur={(ev) => { if (ev.target.value !== (feedbackMap[key] ?? "")) run(() => saveFeedback(s.id, e.userId!, ev.target.value)); }}
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
        )}
      </section>
    </div>
  );
}
