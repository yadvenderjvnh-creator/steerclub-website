"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { inviteParent, revokeParentLink } from "../family-actions";

type Parent = { parentId: string; name: string; email: string; relationship: string | null };

const input = "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2.5 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";

export function FamilyInvite({ parents }: { parents: Parent[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function invite() {
    setMsg(null); setErr(null);
    startTransition(async () => {
      const r = await inviteParent({ email, relationship });
      if (!r.ok) setErr(r.error ?? "Failed.");
      else { setEmail(""); setRelationship(""); setMsg("Invite sent."); router.refresh(); }
    });
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-6 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
        <div><label className={label}>Parent / guardian email</label><input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parent@email.com" /></div>
        <div><label className={label}>Relationship</label><input className={input} value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="Mother, Father…" /></div>
        <button onClick={invite} disabled={pending || !email.trim()} className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50">{pending ? "…" : "Invite"}</button>
      </div>
      {msg && <p className="text-lime text-xs font-ui">{msg}</p>}
      {err && <p className="text-orange-400 text-xs font-ui">{err}</p>}

      {parents.length > 0 && (
        <div className="glass rounded-xl divide-y divide-white/5">
          {parents.map((p) => (
            <div key={p.parentId} className="p-4 flex items-center justify-between">
              <div><p className="text-white font-ui">{p.name} <span className="text-steel text-xs">· {p.relationship ?? "Guardian"}</span></p><p className="text-steel text-xs">{p.email}</p></div>
              <RevokeBtn parentId={p.parentId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RevokeBtn({ parentId }: { parentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } startTransition(async () => { await revokeParentLink(parentId); router.refresh(); }); }} disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"} disabled:opacity-50`}>
      {pending ? "…" : armed ? "Confirm" : "Remove"}
    </button>
  );
}
