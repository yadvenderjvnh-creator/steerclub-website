"use client";

import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatINR } from "@/lib/utils";
import { RefundButton } from "./refund-button";

export type PaymentRow = {
  id: string;
  source: string;
  item: string;
  name: string;
  email: string;
  amount: number;
  status: string;
  paymentId: string | null;
  invoiceId?: string | null;
  createdAt: string;
};

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const columns: Column<PaymentRow>[] = [
    {
      key: "createdAt",
      header: "Date",
      value: (r) => r.createdAt,
      render: (r) => new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
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
    { key: "item", header: "Item", value: (r) => r.item },
    {
      key: "source",
      header: "Type",
      value: (r) => r.source,
      render: (r) => <span className="text-xs font-ui uppercase tracking-wide text-steel">{r.source}</span>,
    },
    { key: "amount", header: "Amount", value: (r) => r.amount, render: (r) => formatINR(r.amount) },
    {
      key: "paymentId",
      header: "Payment ID",
      value: (r) => r.paymentId ?? "",
      render: (r) => <span className="text-xs font-mono text-steel">{r.paymentId ?? "—"}</span>,
    },
    { key: "status", header: "Status", value: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "invoice",
      header: "Invoice",
      value: (r) => (r.invoiceId ? "1" : ""),
      render: (r) =>
        r.invoiceId ? (
          <a href={`/admin/payments/invoice/${r.invoiceId}`} target="_blank" rel="noreferrer" className="text-lime font-heading font-black text-xs uppercase hover:underline">
            PDF ↗
          </a>
        ) : (
          <span className="text-steel text-xs">—</span>
        ),
    },
    { key: "refund", header: "", value: () => "", render: (r) => <RefundButton row={r} /> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      exportName="steerclub-payments"
      searchPlaceholder="Search payments…"
      emptyLabel="No payments yet."
    />
  );
}
