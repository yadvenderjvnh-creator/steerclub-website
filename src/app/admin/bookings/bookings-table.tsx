"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/data-table";
import { updateBookingStatus } from "../actions";
import { formatINR } from "@/lib/utils";

export type BookingRow = {
  id: string;
  kind: "assessment" | "program";
  item: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  amount: number;
  status: string;
  createdAt: string;
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled", "refunded"];

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(row: BookingRow, status: string) {
    startTransition(async () => {
      await updateBookingStatus(
        row.kind,
        row.id,
        status as "pending" | "confirmed" | "completed" | "cancelled" | "refunded"
      );
      router.refresh();
    });
  }

  const columns: Column<BookingRow>[] = [
    {
      key: "createdAt",
      header: "Date",
      value: (r) => r.createdAt,
      render: (r) =>
        new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    },
    {
      key: "name",
      header: "Customer",
      value: (r) => r.name,
      render: (r) => (
        <div>
          <p className="text-white">{r.name}</p>
          <p className="text-xs text-steel">{r.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone", value: (r) => r.phone },
    { key: "item", header: "Item", value: (r) => r.item },
    { key: "city", header: "City", value: (r) => r.city, render: (r) => <span className="capitalize">{r.city}</span> },
    { key: "amount", header: "Amount", value: (r) => r.amount, render: (r) => formatINR(r.amount) },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => change(r, e.target.value)}
          disabled={pending}
          className="bg-graphite border border-white/10 rounded px-2 py-1 text-xs text-white font-ui focus:outline-none focus:border-lime/50 capitalize disabled:opacity-50"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      exportName="steerclub-bookings"
      searchPlaceholder="Search by name, email, city…"
      emptyLabel="No bookings yet."
    />
  );
}
