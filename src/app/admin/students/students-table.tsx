"use client";

import { DataTable, type Column } from "@/components/admin/data-table";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  bookings: number;
  lastLoginAt: string | null;
  createdAt: string;
};

export function StudentsTable({ rows }: { rows: StudentRow[] }) {
  const columns: Column<StudentRow>[] = [
    { key: "name", header: "Name", value: (r) => r.name },
    { key: "email", header: "Email", value: (r) => r.email },
    { key: "phone", header: "Phone", value: (r) => r.phone ?? "" },
    {
      key: "city",
      header: "City",
      value: (r) => r.city ?? "",
      render: (r) => <span className="capitalize">{r.city ?? "—"}</span>,
    },
    { key: "bookings", header: "Bookings", value: (r) => r.bookings },
    {
      key: "lastLoginAt",
      header: "Last login",
      value: (r) => r.lastLoginAt ?? "",
      render: (r) =>
        r.lastLoginAt
          ? new Date(r.lastLoginAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : "—",
    },
    {
      key: "createdAt",
      header: "Joined",
      value: (r) => r.createdAt,
      render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      exportName="steerclub-students"
      searchPlaceholder="Search students…"
      emptyLabel="No students yet. Members appear here after their first sign-in."
    />
  );
}
