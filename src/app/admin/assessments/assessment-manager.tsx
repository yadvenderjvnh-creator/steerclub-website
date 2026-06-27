"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/data-table";
import { recordAssessment } from "../actions";
import { PROGRAMS, getRecommendedProgram } from "@/lib/utils";

export type ScoreRow = {
  id: string;
  email: string;
  total: number;
  recommendedProgram: string;
  assessmentDate: string;
};

const DIMENSIONS = [
  { key: "vehicleControl", label: "Vehicle Control" },
  { key: "hazardPerception", label: "Hazard Perception" },
  { key: "cityNavigation", label: "City Navigation" },
  { key: "highwayDriving", label: "Highway Driving" },
  { key: "allConditions", label: "All Conditions" },
  { key: "defensiveDriving", label: "Defensive Driving" },
] as const;

type DimKey = (typeof DIMENSIONS)[number]["key"];

export function AssessmentManager({ rows }: { rows: ScoreRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dims, setDims] = useState<Record<DimKey, number>>({
    vehicleControl: 50,
    hazardPerception: 50,
    cityNavigation: 50,
    highwayDriving: 50,
    allConditions: 50,
    defensiveDriving: 50,
  });

  const total = useMemo(
    () => Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / DIMENSIONS.length),
    [dims]
  );
  const recommended = useMemo(() => getRecommendedProgram(total), [total]);
  const [program, setProgram] = useState<string>("");

  const activeProgram = program || recommended.slug;

  function submit() {
    if (!email.trim()) return;
    startTransition(async () => {
      await recordAssessment({
        email,
        total,
        dimensions: dims,
        recommendedProgram: activeProgram,
        assessmentDate: date,
      });
      router.refresh();
      setOpen(false);
      setEmail("");
    });
  }

  const columns: Column<ScoreRow>[] = [
    {
      key: "assessmentDate",
      header: "Date",
      value: (r) => r.assessmentDate,
      render: (r) => new Date(r.assessmentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }),
    },
    { key: "email", header: "Email", value: (r) => r.email },
    {
      key: "total",
      header: "Score",
      value: (r) => r.total,
      render: (r) => <span className="font-heading font-black text-lime">{r.total}</span>,
    },
    {
      key: "recommendedProgram",
      header: "Recommended",
      value: (r) => r.recommendedProgram,
      render: (r) => <span className="capitalize">{r.recommendedProgram.replace(/-/g, " ")}</span>,
    },
  ];

  const inputCls =
    "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90"
        >
          {open ? "Close" : "Record Score"}
        </button>
      </div>

      {open && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-5">
            Record Steer Score
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">
                Customer Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">
                Assessment Date
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {DIMENSIONS.map((d) => (
              <div key={d.key}>
                <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">
                  {d.label}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={dims[d.key]}
                  onChange={(e) =>
                    setDims((prev) => ({ ...prev, [d.key]: Math.max(0, Math.min(100, Number(e.target.value))) }))
                  }
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs font-ui uppercase tracking-widest text-steel mb-1">Total Score</p>
              <p className="font-heading font-black text-4xl text-lime">{total}</p>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-1.5">
                Recommended Program
              </label>
              <select value={activeProgram} onChange={(e) => setProgram(e.target.value)} className={`${inputCls} capitalize`}>
                {PROGRAMS.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={submit}
              disabled={pending || !email.trim()}
              className="bg-lime text-asphalt font-heading font-black text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save Score"}
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        exportName="steerclub-assessments"
        searchPlaceholder="Search by email…"
        emptyLabel="No scores recorded yet."
      />
    </div>
  );
}
