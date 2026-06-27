"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CITIES } from "@/lib/utils";
import { updateProfile } from "../actions";

type CommPrefs = { email: boolean; whatsapp: boolean; sms: boolean };

type Initial = {
  name: string;
  email: string;
  phone: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  vehicleOwned: string;
  drivingGoals: string;
  commPrefs: CommPrefs;
  directoryVisible: boolean;
};

const input =
  "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 placeholder:text-steel";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-2";

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Initial>(initial);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await updateProfile({
        name: form.name,
        phone: form.phone || null,
        city: form.city || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
        vehicleOwned: form.vehicleOwned || null,
        drivingGoals: form.drivingGoals || null,
        commPrefs: form.commPrefs,
        directoryVisible: form.directoryVisible,
      });
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Personal */}
      <section className="glass rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Full Name</label>
            <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input className={`${input} opacity-60`} value={form.email} disabled />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input className={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={label}>City</label>
            <select className={`${input} appearance-none`} value={form.city} onChange={(e) => set("city", e.target.value)}>
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Driving */}
      <section className="glass rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Driving</h2>
        <div>
          <label className={label}>Vehicle Owned</label>
          <input className={input} value={form.vehicleOwned} onChange={(e) => set("vehicleOwned", e.target.value)} placeholder="e.g. Maruti Swift (manual)" />
        </div>
        <div>
          <label className={label}>Driving Goals</label>
          <textarea
            className={`${input} resize-none`}
            rows={3}
            value={form.drivingGoals}
            onChange={(e) => set("drivingGoals", e.target.value)}
            placeholder="e.g. confident highway driving, a Spiti road trip…"
          />
        </div>
      </section>

      {/* Emergency contact */}
      <section className="glass rounded-xl p-6 space-y-5">
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Name</label>
            <input className={input} value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input className={input} value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="glass rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Preferences</h2>
        <p className="text-xs font-ui uppercase tracking-widest text-steel">Notify me by</p>
        <div className="flex flex-wrap gap-5">
          {(["email", "whatsapp", "sms"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-white/70 font-ui capitalize">
              <input
                type="checkbox"
                className="w-4 h-4 accent-lime"
                checked={form.commPrefs[k]}
                onChange={(e) => set("commPrefs", { ...form.commPrefs, [k]: e.target.checked })}
              />
              {k}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70 font-ui pt-2 border-t border-white/5">
          <input
            type="checkbox"
            className="w-4 h-4 accent-lime"
            checked={form.directoryVisible}
            onChange={(e) => set("directoryVisible", e.target.checked)}
          />
          Show me in the member directory
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={pending}
          className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-6 py-3 rounded-lg hover:bg-lime/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-lime font-ui">
            <CheckCircle2 className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
