"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { SlideOver } from "@/components/admin/slide-over";
import { updateLead, addLeadActivity, convertWaitlistToLead } from "../actions";

type Activity = {
  id: string;
  type: string;
  note: string | null;
  actorName: string | null;
  createdAt: string;
};

export type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string | null;
  status: string;
  stage: string | null;
  notes: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  activities: Activity[];
};

export type WaitlistRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  type: string;
  source: string | null;
  createdAt: string;
};

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

export function LeadsManager({
  leads,
  waitlist,
}: {
  leads: LeadRow[];
  waitlist: WaitlistRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<LeadRow | null>(null);
  const [newNote, setNewNote] = useState("");

  // local editable copy of the active lead
  const [draft, setDraft] = useState<Partial<LeadRow>>({});

  function openLead(l: LeadRow) {
    setActive(l);
    setDraft({ status: l.status, stage: l.stage, notes: l.notes, nextFollowUpAt: l.nextFollowUpAt });
    setNewNote("");
  }

  function save() {
    if (!active) return;
    startTransition(async () => {
      await updateLead(active.id, {
        status: draft.status as "new" | "contacted" | "qualified" | "converted" | "lost",
        stage: draft.stage ?? null,
        notes: draft.notes ?? null,
        nextFollowUpAt: draft.nextFollowUpAt ?? null,
      });
      router.refresh();
      setActive(null);
    });
  }

  function logNote() {
    if (!active || !newNote.trim()) return;
    startTransition(async () => {
      await addLeadActivity(active.id, "note", newNote.trim());
      router.refresh();
      setNewNote("");
      setActive(null);
    });
  }

  function convert(w: WaitlistRow) {
    startTransition(async () => {
      await convertWaitlistToLead(w.id);
      router.refresh();
    });
  }

  const leadColumns: Column<LeadRow>[] = [
    { key: "name", header: "Name", value: (r) => r.name ?? "", render: (r) => r.name ?? "—" },
    { key: "email", header: "Email", value: (r) => r.email ?? "" },
    { key: "phone", header: "Phone", value: (r) => r.phone ?? "" },
    { key: "city", header: "City", value: (r) => r.city ?? "", render: (r) => <span className="capitalize">{r.city ?? "—"}</span> },
    { key: "source", header: "Source", value: (r) => r.source ?? "" },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "createdAt",
      header: "Added",
      value: (r) => r.createdAt,
      render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    },
  ];

  const waitlistColumns: Column<WaitlistRow>[] = [
    { key: "name", header: "Name", value: (r) => r.name ?? "", render: (r) => r.name ?? "—" },
    { key: "email", header: "Email", value: (r) => r.email },
    { key: "phone", header: "Phone", value: (r) => r.phone ?? "" },
    { key: "city", header: "City", value: (r) => r.city ?? "", render: (r) => <span className="capitalize">{r.city ?? "—"}</span> },
    { key: "type", header: "Type", value: (r) => r.type },
    { key: "source", header: "Source", value: (r) => r.source ?? "" },
    {
      key: "action",
      header: "",
      sortable: false,
      render: (r) => (
        <button
          onClick={() => convert(r)}
          disabled={pending}
          className="text-xs font-ui text-lime hover:underline disabled:opacity-50"
        >
          → Lead
        </button>
      ),
    },
  ];

  const inputCls =
    "w-full bg-asphalt border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";

  return (
    <div className="space-y-10">
      <section>
        <DataTable
          columns={leadColumns}
          rows={leads}
          exportName="steerclub-leads"
          searchPlaceholder="Search leads…"
          onRowClick={openLead}
          emptyLabel="No leads yet. Convert a waitlist signup below to start."
        />
        <p className="text-xs text-steel font-ui mt-2">Click a lead to update status & log follow-ups.</p>
      </section>

      <section>
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-3">
          Waitlist Signups
        </h2>
        <DataTable
          columns={waitlistColumns}
          rows={waitlist}
          exportName="steerclub-waitlist"
          searchPlaceholder="Search waitlist…"
          emptyLabel="No waitlist signups yet."
        />
      </section>

      <SlideOver open={!!active} onClose={() => setActive(null)} title={active?.name ?? "Lead"}>
        {active && (
          <div className="space-y-5">
            <div className="text-sm text-white/70 font-ui space-y-1">
              <p>{active.email}</p>
              <p>{active.phone}</p>
              <p className="capitalize">{active.city} · {active.source}</p>
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">Status</label>
              <select
                value={draft.status ?? active.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                className={`${inputCls} capitalize`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">Stage</label>
              <input
                value={draft.stage ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value }))}
                placeholder="e.g. demo booked, awaiting payment"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">Next follow-up</label>
              <input
                type="date"
                value={draft.nextFollowUpAt ? draft.nextFollowUpAt.slice(0, 10) : ""}
                onChange={(e) => setDraft((d) => ({ ...d, nextFollowUpAt: e.target.value || null }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">Notes</label>
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            <button
              onClick={save}
              disabled={pending}
              className="w-full bg-lime text-asphalt font-heading font-black text-sm uppercase py-3 rounded-lg hover:bg-lime/90 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>

            {/* Activity timeline */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-3">Follow-up log</p>
              <div className="flex gap-2 mb-4">
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a call/note…"
                  className={inputCls}
                />
                <button
                  onClick={logNote}
                  disabled={pending || !newNote.trim()}
                  className="shrink-0 border border-white/20 text-white text-sm font-ui px-3 rounded-lg hover:border-lime/50 disabled:opacity-50"
                >
                  Log
                </button>
              </div>
              <ul className="space-y-3">
                {active.activities.length === 0 ? (
                  <li className="text-xs text-steel font-ui">No activity yet.</li>
                ) : (
                  active.activities.map((a) => (
                    <li key={a.id} className="text-sm">
                      <p className="text-white/80 font-ui">{a.note}</p>
                      <p className="text-xs text-steel font-ui">
                        {a.actorName ?? "system"} ·{" "}
                        {new Date(a.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
