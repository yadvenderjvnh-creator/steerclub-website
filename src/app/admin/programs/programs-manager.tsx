"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCohort } from "../delivery-actions";
import { CITIES } from "@/lib/utils";

export type ProgramOpt = { id: string; name: string; sessions: number };
export type CoachOpt = { id: string; name: string };
export type CohortRow = {
  id: string;
  programName: string;
  city: string;
  startDate: string;
  maxSize: number;
  currentSize: number;
  isOpen: boolean;
  coachName: string | null;
};

const input =
  "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";

export function ProgramsManager({
  programs,
  coaches,
  cohorts,
}: {
  programs: ProgramOpt[];
  coaches: CoachOpt[];
  cohorts: CohortRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    programId: programs[0]?.id ?? "",
    city: "chandigarh",
    startDate: new Date().toISOString().slice(0, 10),
    maxSize: 8,
    instructorId: "",
  });

  function save() {
    if (!form.programId) return;
    startTransition(async () => {
      await createCohort({
        programId: form.programId,
        city: form.city as "chandigarh",
        startDate: form.startDate,
        maxSize: Number(form.maxSize),
        instructorId: form.instructorId || null,
      });
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90"
        >
          {open ? "Close" : "Create Cohort"}
        </button>
      </div>

      {open && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-5">New Cohort</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className={label}>Program</label>
              <select className={`${input} appearance-none`} value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sessions} sessions)</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>City</label>
              <select className={`${input} appearance-none capitalize`} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Start Date</label>
              <input type="date" className={input} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className={label}>Max Size</label>
              <input type="number" min={1} className={input} value={form.maxSize} onChange={(e) => setForm({ ...form, maxSize: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Coach</label>
              <select className={`${input} appearance-none`} value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}>
                <option value="">Unassigned</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <button onClick={save} disabled={pending} className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50">
                {pending ? "Creating…" : "Create Cohort"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Program", "City", "Start", "Enrolled", "Coach", ""].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-steel font-ui text-sm">No cohorts yet. Create one above.</td></tr>
            ) : (
              cohorts.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{c.programName}</td>
                  <td className="px-4 py-3 text-white/80 capitalize">{c.city}</td>
                  <td className="px-4 py-3 text-white/80">{new Date(c.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                  <td className="px-4 py-3 text-white/80">{c.currentSize}/{c.maxSize}</td>
                  <td className="px-4 py-3 text-white/80">{c.coachName ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/programs/cohorts/${c.id}`} className="text-lime font-heading font-black text-xs uppercase hover:underline">Manage →</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
