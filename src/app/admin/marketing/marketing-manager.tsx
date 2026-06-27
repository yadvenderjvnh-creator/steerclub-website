"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import {
  createCoupon,
  toggleCoupon,
  deleteCoupon,
  createCampaign,
  sendCampaignNow,
  sendTestCampaign,
  deleteCampaign,
  type CouponInput,
  type CampaignInput,
} from "../marketing-actions";

export type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  appliesTo: string;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
  validTo: string | null;
};
export type ReferrerRow = { code: string; name: string; email: string; total: number; qualified: number };
export type CampaignRow = {
  id: string;
  name: string;
  channel: string;
  segment: string;
  status: string;
  sentAt: string | null;
  stats: { recipients: number; sent: number; failed: number } | null;
};
export type Segment = { key: string; label: string };

const input = "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";
const btn = "bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50";

function emptyCoupon(): CouponInput {
  return { code: "", type: "percent", value: 10, minAmount: 0, appliesTo: "all", validTo: null, usageLimit: null };
}

export function MarketingManager({
  coupons,
  referrers,
  campaigns,
  segments,
  adminEmail,
}: {
  coupons: CouponRow[];
  referrers: ReferrerRow[];
  campaigns: CampaignRow[];
  segments: Segment[];
  adminEmail: string;
}) {
  const [tab, setTab] = useState<"campaigns" | "coupons" | "referrals">("campaigns");
  const tabs = [
    { id: "campaigns" as const, label: `Campaigns (${campaigns.length})` },
    { id: "coupons" as const, label: `Coupons (${coupons.length})` },
    { id: "referrals" as const, label: `Referrals (${referrers.length})` },
  ];
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 font-heading font-black text-xs uppercase tracking-wide -mb-px border-b-2 ${tab === t.id ? "border-lime text-lime" : "border-transparent text-steel hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "campaigns" && <CampaignsTab campaigns={campaigns} segments={segments} adminEmail={adminEmail} />}
      {tab === "coupons" && <CouponsTab coupons={coupons} />}
      {tab === "referrals" && <ReferralsTab referrers={referrers} />}
    </div>
  );
}

function emptyCampaign(): CampaignInput {
  return { name: "", channel: "email", segment: "all_leads", subject: "", body: "", scheduledAt: null };
}

function CampaignsTab({ campaigns, segments, adminEmail }: { campaigns: CampaignRow[]; segments: Segment[]; adminEmail: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<CampaignInput | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function create(thenSend: boolean) {
    if (!form) return;
    setMsg(null);
    startTransition(async () => {
      const res = await createCampaign(form);
      if (!res.ok || !res.id) { setMsg(res.error ?? "Failed."); return; }
      if (thenSend) {
        const s = await sendCampaignNow(res.id);
        setMsg(s.ok ? `Sent to ${s.sent} recipients.` : s.error ?? "Send failed.");
      }
      setForm(null);
      router.refresh();
    });
  }

  function sendTest() {
    if (!form) return;
    setMsg(null);
    startTransition(async () => {
      await sendTestCampaign({ subject: form.subject, body: form.body, toEmail: adminEmail });
      setMsg(`Test email sent to ${adminEmail}.`);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-steel text-xs font-ui">Email campaigns send via Resend. WhatsApp & Push are scaffolded (configure their APIs to enable). Use <code className="text-white/70">{"{{name}}"}</code> for personalization.</p>
        <button onClick={() => setForm(form ? null : emptyCampaign())} className={btn}>{form ? "Close" : "New Campaign"}</button>
      </div>

      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className={label}>Name</label>
              <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={label}>Channel</label>
              <select className={`${input} appearance-none`} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as CampaignInput["channel"] })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp (soon)</option>
                <option value="push">Push (soon)</option>
              </select>
            </div>
            <div>
              <label className={label}>Audience</label>
              <select className={`${input} appearance-none`} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                {segments.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Subject</label>
            <input className={input} value={form.subject ?? ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div>
            <label className={label}>Body (HTML allowed)</label>
            <textarea rows={6} className={input} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => create(true)} disabled={pending} className={btn}>{pending ? "Working…" : "Send now"}</button>
            <button onClick={() => create(false)} disabled={pending} className="border border-white/15 text-white/80 font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-white/5 disabled:opacity-50">Save draft</button>
            <button onClick={sendTest} disabled={pending} className="border border-white/15 text-white/80 font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-white/5 disabled:opacity-50">Send test to me</button>
          </div>
          {msg && <p className="text-lime text-xs font-ui">{msg}</p>}
        </div>
      )}
      {!form && msg && <p className="text-lime text-xs font-ui">{msg}</p>}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Campaign", "Channel", "Audience", "Status", "Results", ""].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-steel font-ui text-sm">No campaigns yet.</td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{c.name}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{c.channel}</td>
                  <td className="px-4 py-3 text-white/70">{c.segment}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.status === "sent" ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"}`}>{c.status}</span></td>
                  <td className="px-4 py-3 text-white/70">{c.stats ? `${c.stats.sent}/${c.stats.recipients} sent` : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.status !== "sent" && <SendBtn id={c.id} />}
                      <CampaignDeleteBtn id={c.id} />
                    </div>
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

function SendBtn({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(async () => { await sendCampaignNow(id); router.refresh(); })} disabled={pending}
      className="text-lime font-heading font-black text-xs uppercase hover:underline disabled:opacity-50">
      {pending ? "…" : "Send"}
    </button>
  );
}

function CampaignDeleteBtn({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } startTransition(async () => { await deleteCampaign(id); router.refresh(); }); }} disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"} disabled:opacity-50`}>
      {pending ? "…" : armed ? "Confirm" : "Delete"}
    </button>
  );
}

function CouponsTab({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<CouponInput | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function save() {
    if (!form) return;
    setErr(null);
    startTransition(async () => {
      const res = await createCoupon(form);
      if (!res.ok) setErr(res.error ?? "Failed.");
      else { setForm(null); router.refresh(); }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setForm(form ? null : emptyCoupon())} className={btn}>{form ? "Close" : "New Coupon"}</button>
      </div>

      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={label}>Code</label>
              <input className={`${input} uppercase`} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className={label}>Type</label>
              <select className={`${input} appearance-none`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "flat" | "percent" })}>
                <option value="percent">Percent %</option>
                <option value="flat">Flat ₹</option>
              </select>
            </div>
            <div>
              <label className={label}>{form.type === "percent" ? "Percent (1–100)" : "Amount (₹)"}</label>
              <input type="number" className={input} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Applies To</label>
              <select className={`${input} appearance-none`} value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value as CouponInput["appliesTo"] })}>
                <option value="all">All</option>
                <option value="assessment">Assessment</option>
                <option value="program">Program</option>
                <option value="event">Event</option>
                <option value="membership">Membership</option>
              </select>
            </div>
            <div>
              <label className={label}>Min order (₹, optional)</label>
              <input type="number" className={input} value={form.minAmount ?? 0} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Usage limit (optional)</label>
              <input type="number" className={input} value={form.usageLimit ?? ""} onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <label className={label}>Expires (optional)</label>
              <input type="date" className={input} value={form.validTo ?? ""} onChange={(e) => setForm({ ...form, validTo: e.target.value || null })} />
            </div>
            <div className="flex items-end">
              <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Create"}</button>
            </div>
          </div>
          {err && <p className="text-orange-400 text-xs font-ui">{err}</p>}
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Code", "Discount", "Applies", "Used", "Expires", "Status", ""].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-steel font-ui text-sm">No coupons yet.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-heading font-black">{c.code}</td>
                  <td className="px-4 py-3 text-white/80">{c.type === "percent" ? `${c.value}%` : formatINR(c.value)}{c.minAmount > 0 && <span className="text-steel text-xs"> · min {formatINR(c.minAmount)}</span>}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{c.appliesTo}</td>
                  <td className="px-4 py-3 text-white/70">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                  <td className="px-4 py-3 text-white/70">{c.validTo ? new Date(c.validTo).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}</td>
                  <td className="px-4 py-3">
                    <ToggleBtn id={c.id} active={c.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right"><DeleteBtn id={c.id} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleBtn({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(async () => { await toggleCoupon(id, !active); router.refresh(); })} disabled={pending}
      className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${active ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"} disabled:opacity-50`}>
      {active ? "Active" : "Off"}
    </button>
  );
}

function DeleteBtn({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } startTransition(async () => { await deleteCoupon(id); router.refresh(); }); }} disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"} disabled:opacity-50`}>
      {pending ? "…" : armed ? "Confirm" : "Delete"}
    </button>
  );
}

function ReferralsTab({ referrers }: { referrers: ReferrerRow[] }) {
  if (referrers.length === 0) {
    return <div className="glass rounded-xl p-12 text-center text-steel font-ui text-sm">No referral codes yet. Members generate one from their dashboard.</div>;
  }
  return (
    <div className="glass rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5">
            {["Member", "Code", "Referred", "Qualified"].map((h) => (
              <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {referrers.map((r) => (
            <tr key={r.code} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-4 py-3"><div className="text-white">{r.name}</div><div className="text-steel text-xs">{r.email}</div></td>
              <td className="px-4 py-3 text-white/80 font-heading font-black">{r.code}</td>
              <td className="px-4 py-3 text-white/70">{r.total}</td>
              <td className="px-4 py-3 text-lime font-heading font-black">{r.qualified}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
