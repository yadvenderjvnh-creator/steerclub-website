"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteCoach } from "../delivery-actions";
import { CITIES, formatINR } from "@/lib/utils";

export type CoachRow = {
  id: string;
  name: string;
  email: string | null;
  city: string;
  ratePerSession: number;
  isActive: boolean;
  hasLogin: boolean;
  completedSessions: number;
};

const input =
  "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";

export function CoachesManager({ coaches }: { coaches: CoachRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "chandigarh", rateRupees: 0 });

  function invite() {
    if (!form.name.trim() || !form.email.trim()) return;
    startTransition(async () => {
      await inviteCoach({
        name: form.name,
        email: form.email,
        city: form.city as "chandigarh",
        ratePerSession: Math.round(form.rateRupees * 100),
      });
      router.refresh();
      setOpen(false);
      setForm({ name: "", email: "", city: "chandigarh", rateRupees: 0 });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setOpen((o) => !o)} className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90">
          {open ? "Close" : "Invite Coach"}
        </button>
      </div>

      {open && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-1">Invite a Coach</h2>
          <p className="text-xs text-steel font-ui mb-5">Creates a coach login — they sign in with this email (magic link) and see only their cohorts.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={label}>Name</label>
              <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Coach name" />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="coach@email.com" />
            </div>
            <div>
              <label className={label}>City</label>
              <select className={`${input} appearance-none capitalize`} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Rate / session (₹)</label>
              <input className={input} type="number" min={0} value={form.rateRupees} onChange={(e) => setForm({ ...form, rateRupees: Number(e.target.value) })} />
            </div>
          </div>
          <button onClick={invite} disabled={pending} className="mt-4 bg-lime text-asphalt font-heading font-black text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50">
            {pending ? "Inviting…" : "Send Invite"}
          </button>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Coach", "City", "Rate", "Sessions done", "Payroll", "Login"].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coaches.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-steel font-ui text-sm">No coaches yet. Invite one above.</td></tr>
            ) : (
              coaches.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="text-white">{c.name}</p>
                    <p className="text-xs text-steel">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/80 capitalize">{c.city}</td>
                  <td className="px-4 py-3 text-white/80">{formatINR(c.ratePerSession)}</td>
                  <td className="px-4 py-3 text-white/80">{c.completedSessions}</td>
                  <td className="px-4 py-3 text-white/80">{formatINR(c.ratePerSession * c.completedSessions)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-ui uppercase ${c.hasLogin ? "text-lime" : "text-steel"}`}>{c.hasLogin ? "active" : "pending"}</span>
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
