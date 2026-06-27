"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Download, Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  /** Display renderer. Defaults to the raw `value`. */
  render?: (row: T) => React.ReactNode;
  /** Sortable / searchable / exportable scalar for this cell. */
  value?: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  searchPlaceholder = "Search…",
  exportName,
  onRowClick,
  emptyLabel = "Nothing here yet.",
}: {
  columns: Column<T>[];
  rows: T[];
  searchPlaceholder?: string;
  exportName?: string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let r = rows;
    if (q.trim()) {
      const t = q.toLowerCase();
      r = r.filter((row) =>
        columns.some((c) =>
          String(c.value ? c.value(row) ?? "" : "")
            .toLowerCase()
            .includes(t)
        )
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.value) {
        r = [...r].sort((a, b) => {
          const av = col.value!(a) ?? "";
          const bv = col.value!(b) ?? "";
          if (av < bv) return dir === "asc" ? -1 : 1;
          if (av > bv) return dir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return r;
  }, [rows, q, sortKey, dir, columns]);

  function toggleSort(key: string) {
    if (sortKey === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir("asc");
    }
  }

  function exportCsv() {
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`);
    const lines = filtered.map((row) =>
      columns
        .map((c) => {
          const v = c.value ? c.value(row) ?? "" : "";
          return `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName ?? "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-steel absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-graphite border border-white/10 text-white text-sm font-ui pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-lime/50 placeholder:text-steel"
          />
        </div>
        <span className="text-xs text-steel font-ui ml-auto">{filtered.length} rows</span>
        {exportName && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs font-ui text-white/70 hover:text-lime border border-white/10 hover:border-lime/40 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3 whitespace-nowrap ${c.className ?? ""}`}
                >
                  {c.sortable !== false && c.value ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {c.header}
                      <ArrowUpDown className="w-3 h-3 opacity-50" />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-steel font-ui text-sm"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-t border-white/5 ${
                    onRowClick ? "cursor-pointer hover:bg-white/5" : ""
                  } transition-colors`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-white/80 ${c.className ?? ""}`}>
                      {c.render ? c.render(row) : (c.value ? c.value(row) : "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
