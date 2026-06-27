"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { markEventAttendance } from "../../../community-actions";

export type RegRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  status: string;
  amount: number;
  attended: boolean;
};

export function EventRoster({ eventTitle, rows }: { eventTitle: string; rows: RegRow[] }) {
  function exportCsv() {
    const head = ["Name", "Email", "Phone", "City", "Status", "Amount", "Attended"];
    const lines = rows.map((r) =>
      [r.name, r.email, r.phone ?? "", r.city ?? "", r.status, (r.amount / 100).toString(), r.attended ? "yes" : "no"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [head.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={exportCsv} className="border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5" disabled={rows.length === 0}>
          Export CSV
        </button>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Member", "City", "Status", "Paid", "Attendance"].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-steel font-ui text-sm">No registrations yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white">{r.name}</div>
                    <div className="text-steel text-xs">{r.email}{r.phone ? ` · ${r.phone}` : ""}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70 capitalize">{r.city ?? "—"}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-white/70">{r.amount > 0 ? formatINR(r.amount) : "Free"}</td>
                  <td className="px-4 py-3">
                    <AttendanceToggle id={r.id} attended={r.attended} disabled={r.status !== "confirmed"} />
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

function AttendanceToggle({ id, attended, disabled }: { id: string; attended: boolean; disabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => { await markEventAttendance(id, !attended); router.refresh(); })}
      disabled={pending || disabled}
      className={`text-[10px] font-ui uppercase tracking-widest px-3 py-1.5 rounded-full border ${
        attended ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"
      } disabled:opacity-40`}
    >
      {pending ? "…" : attended ? "Present" : "Mark present"}
    </button>
  );
}
