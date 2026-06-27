"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { formatINR } from "@/lib/utils";

export type AppliedCoupon = { code: string; discount: number; finalAmount: number };

/**
 * Coupon input for checkout. Validates against /api/coupons/validate and reports
 * the applied coupon to the parent (which sends `couponCode` to create-order/verify).
 */
export function CouponField({
  source,
  amount,
  applied,
  onApply,
  onClear,
}: {
  source: string;
  amount: number;
  applied: AppliedCoupon | null;
  onApply: (c: AppliedCoupon) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, source, amount }),
      });
      const data = await res.json();
      if (data.valid) {
        onApply({ code: data.code, discount: data.discount, finalAmount: data.finalAmount });
        setCode("");
      } else {
        setError(data.error ?? "Invalid coupon.");
      }
    } catch {
      setError("Could not validate coupon.");
    }
    setLoading(false);
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-lime/10 border border-lime/30 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2 text-lime font-ui text-sm">
          <Tag className="w-4 h-4" />
          <span className="font-heading font-black uppercase">{applied.code}</span>
          <span className="text-white/70">−{formatINR(applied.discount)}</span>
        </div>
        <button onClick={onClear} className="text-steel hover:text-white" aria-label="Remove coupon">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="flex-1 bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 placeholder:text-steel uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={loading || !code.trim()}
          className="border border-white/20 text-white font-heading font-black text-xs uppercase px-5 rounded-lg hover:border-lime/50 hover:text-lime disabled:opacity-50"
        >
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-orange-400 text-xs font-ui mt-1.5">{error}</p>}
    </div>
  );
}
