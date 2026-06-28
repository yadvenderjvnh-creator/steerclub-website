"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOrgSettings, inviteAdmin, upsertTemplate, createApiKeyAction, revokeApiKey } from "../settings-actions";

export type AuditRow = { id: string; action: string; entity: string; entityId: string | null; actorName: string | null; createdAt: string };
export type TeamRow = { id: string; name: string; email: string; role: string };
export type TemplateRow = { key: string; subject: string; body: string; overridden: boolean };
export type ApiKeyRow = { id: string; name: string; prefix: string; lastUsedAt: string | null; createdAt: string };
export type OrgSettings = { legalName: string; gstin: string; gstRate: number; hsn: string; supportEmail: string; brandLogoUrl: string };

const input = "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";
const btn = "bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50";
const ghost = "border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5";

export function SettingsManager({ org, templates, apiKeysList, team, audit }: { org: OrgSettings; templates: TemplateRow[]; apiKeysList: ApiKeyRow[]; team: TeamRow[]; audit: AuditRow[] }) {
  const [tab, setTab] = useState<"audit" | "team" | "branding" | "templates" | "apikeys">("audit");
  const tabs = [
    { id: "audit" as const, label: "Audit Log" },
    { id: "team" as const, label: "Team" },
    { id: "branding" as const, label: "Branding & Tax" },
    { id: "templates" as const, label: "Templates" },
    { id: "apikeys" as const, label: "API Keys" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 font-heading font-black text-xs uppercase tracking-wide -mb-px border-b-2 whitespace-nowrap ${tab === t.id ? "border-lime text-lime" : "border-transparent text-steel hover:text-white"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "audit" && <AuditTab audit={audit} />}
      {tab === "team" && <TeamTab team={team} />}
      {tab === "branding" && <BrandingTab org={org} />}
      {tab === "templates" && <TemplatesTab templates={templates} />}
      {tab === "apikeys" && <ApiKeysTab keys={apiKeysList} />}
    </div>
  );
}

function AuditTab({ audit }: { audit: AuditRow[] }) {
  const [q, setQ] = useState("");
  const rows = audit.filter((a) => !q || `${a.action} ${a.entity} ${a.actorName ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <input placeholder="Filter by action / entity / actor…" value={q} onChange={(e) => setQ(e.target.value)} className={`${input} max-w-sm`} />
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-white/5">{["When", "Actor", "Action", "Entity"].map((h) => <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={4} className="px-4 py-12 text-center text-steel font-ui text-sm">No activity.</td></tr> : rows.map((a) => (
              <tr key={a.id} className="border-t border-white/5">
                <td className="px-4 py-2.5 text-steel text-xs">{new Date(a.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="px-4 py-2.5 text-white/80">{a.actorName ?? "system"}</td>
                <td className="px-4 py-2.5 text-white font-ui">{a.action}</td>
                <td className="px-4 py-2.5 text-white/60">{a.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamTab({ team }: { team: TeamRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  function invite() {
    setMsg(null);
    startTransition(async () => { const r = await inviteAdmin({ email }); if (!r.ok) setMsg(r.error ?? "Failed."); else { setEmail(""); setMsg("Admin added."); router.refresh(); } });
  }
  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]"><label className={label}>Invite admin by email</label><input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@email.com" /></div>
        <button onClick={invite} disabled={pending} className={btn}>{pending ? "…" : "Add admin"}</button>
        {msg && <p className="text-lime text-xs font-ui w-full">{msg}</p>}
      </div>
      <div className="glass rounded-xl divide-y divide-white/5">
        {team.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between">
            <div><p className="text-white font-ui">{t.name}</p><p className="text-steel text-xs">{t.email}</p></div>
            <span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.role === "admin" ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"}`}>{t.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandingTab({ org }: { org: OrgSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(org);
  const [msg, setMsg] = useState<string | null>(null);
  function save() { setMsg(null); startTransition(async () => { await saveOrgSettings(form); setMsg("Saved. New invoices use these details."); router.refresh(); }); }
  return (
    <div className="glass rounded-xl p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={label}>Legal name</label><input className={input} value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} /></div>
        <div><label className={label}>Support email</label><input className={input} value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></div>
        <div><label className={label}>GSTIN (enables tax invoices)</label><input className={input} value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></div>
        <div><label className={label}>GST rate %</label><input type="number" className={input} value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: Number(e.target.value) })} /></div>
        <div><label className={label}>HSN / SAC</label><input className={input} value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })} /></div>
        <div><label className={label}>Brand logo URL</label><input className={input} value={form.brandLogoUrl} onChange={(e) => setForm({ ...form, brandLogoUrl: e.target.value })} /></div>
      </div>
      <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save settings"}</button>
      {msg && <p className="text-lime text-xs font-ui">{msg}</p>}
      <p className="text-steel text-xs font-ui">Set a GSTIN to switch new invoices from plain receipts to full CGST/SGST tax invoices — no redeploy.</p>
    </div>
  );
}

function TemplatesTab({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TemplateRow | null>(null);
  function save() { if (!editing) return; startTransition(async () => { await upsertTemplate({ key: editing.key, subject: editing.subject, body: editing.body }); setEditing(null); router.refresh(); }); }
  return (
    <div className="space-y-4">
      <p className="text-steel text-xs font-ui">Edit transactional copy. Use <code className="text-white/70">{"{{var}}"}</code> placeholders. Unedited templates use built-in defaults.</p>
      <div className="glass rounded-xl divide-y divide-white/5">
        {templates.map((t) => (
          <div key={t.key} className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-white font-ui font-heading font-black uppercase text-sm">{t.key}</p><p className="text-steel text-xs">{t.subject}</p></div>
              <button onClick={() => setEditing(editing?.key === t.key ? null : t)} className={ghost}>{editing?.key === t.key ? "Close" : (t.overridden ? "Edit" : "Customize")}</button>
            </div>
            {editing?.key === t.key && (
              <div className="mt-4 space-y-3">
                <div><label className={label}>Subject</label><input className={input} value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} /></div>
                <div><label className={label}>Body (HTML)</label><textarea rows={6} className={input} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
                <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save template"}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiKeysTab({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  function create() {
    startTransition(async () => { const r = await createApiKeyAction(name); if (r.ok && r.token) { setCreated(r.token); setName(""); router.refresh(); } });
  }
  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-5 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]"><label className={label}>New key name</label><input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Zapier integration" /></div>
        <button onClick={create} disabled={pending || !name.trim()} className={btn}>{pending ? "…" : "Generate key"}</button>
      </div>
      {created && (
        <div className="glass rounded-xl p-4 border border-lime/30">
          <p className="text-xs text-steel font-ui mb-1">Copy this now — it won&apos;t be shown again:</p>
          <code className="text-lime font-mono text-sm break-all">{created}</code>
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {keys.length === 0 ? <p className="p-12 text-center text-steel font-ui text-sm">No active keys.</p> : keys.map((k) => (
          <div key={k.id} className="p-4 flex items-center justify-between">
            <div><p className="text-white font-ui">{k.name}</p><p className="text-steel text-xs font-mono">{k.prefix}… · last used {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString("en-IN") : "never"}</p></div>
            <RevokeBtn id={k.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function RevokeBtn({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } startTransition(async () => { await revokeApiKey(id); router.refresh(); }); }} disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"} disabled:opacity-50`}>
      {pending ? "…" : armed ? "Confirm" : "Revoke"}
    </button>
  );
}
