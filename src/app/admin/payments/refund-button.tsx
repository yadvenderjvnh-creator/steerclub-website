"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import { issueRefund } from "../finance-actions";
import type { PaymentRow } from "./payments-table";

const REFUNDABLE = new Set(["confirmed", "completed", "active"]);

export function RefundButton({ row }: { row: PaymentRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!row.paymentId || !REFUNDABLE.has(row.status)) {
    return <span className="text-steel text-xs">—</span>;
  }

  function submit() {
    setErr(null);
    startTransition(async () => {
      const res = await issueRefund({
        source: row.source as "assessment" | "program" | "event" | "membership" | "gift",
        bookingId: row.id,
        paymentId: row.paymentId,
        amount: row.amount,
        email: row.email,
        reason: reason || undefined,
      });
      if (!res.ok) setErr(res.error ?? "Refund failed.");
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border border-white/15 text-steel hover:text-white font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg"
      >
        Refund
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <p className="text-xs text-white/80 font-ui">Refund {formatINR(row.amount)} to {row.name}?</p>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="bg-graphite border border-white/10 text-white text-xs px-2 py-1.5 rounded"
      />
      <div className="flex gap-2">
        <button onClick={submit} disabled={pending} className="bg-orange-500/20 text-orange-400 font-heading font-black text-xs uppercase px-3 py-1.5 rounded disabled:opacity-50">
          {pending ? "…" : "Confirm refund"}
        </button>
        <button onClick={() => setOpen(false)} disabled={pending} className="text-steel text-xs px-2">Cancel</button>
      </div>
      {err && <p className="text-orange-400 text-xs font-ui">{err}</p>}
    </div>
  );
}
