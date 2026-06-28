"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Check } from "lucide-react";
import { CITIES, formatINR } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { CouponField, type AppliedCoupon } from "@/components/checkout/coupon-field";
import type { MembershipPlan } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  city: z.string().min(1, "Select your city"),
});

type JoinForm = z.infer<typeof schema>;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function MembershipJoinClient({ plan }: { plan: MembershipPlan }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinForm>({ resolver: zodResolver(schema) });

  const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice ?? 0;
  const monthlyEquivalent =
    billing === "annual" && plan.annualPrice ? Math.round(plan.annualPrice / 12) : null;

  async function onSubmit(data: JoinForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          tier: plan.tier,
          billing,
          customerData: data,
          couponCode: coupon?.code,
        }),
      });
      const { orderId, amount, currency } = await res.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount,
          currency,
          order_id: orderId,
          name: "SteerClub",
          description: `${plan.name} — ${billing}`,
          image: "/logo.png",
          prefill: { name: data.name, email: data.email, contact: data.phone },
          theme: { color: "#D7FF2F" },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                type: "membership",
                tier: plan.tier,
                billing,
                bookingData: data,
                couponCode: coupon?.code,
                couponDiscount: coupon?.discount,
              }),
            });
            if (verify.ok) setConfirmed(true);
          },
        });
        rzp.open();
      };
    } catch {
      alert("Something went wrong. Please try WhatsApp below.");
    }
    setLoading(false);
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-asphalt flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-lime" />
          </div>
          <h1 className="font-heading font-black text-3xl text-white uppercase mb-3">
            Welcome to {plan.name}.
          </h1>
          <p className="text-white/60 font-body mb-8">
            You&apos;re in. Your membership is active and your dashboard is ready. Member pricing now
            applies to every program you book.
          </p>
          <Link
            href="/dashboard"
            className="block w-full bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pt-24 pb-24">
      <div className="container max-w-[1440px]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/membership"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← All Memberships
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — plan summary */}
            <div>
              <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
                Join SteerClub
              </p>
              <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-3">
                {plan.name}
              </h1>
              <p className="text-white/60 font-body text-lg mb-8">{plan.tagline}</p>

              {/* Billing toggle */}
              <div className="inline-flex bg-graphite rounded-lg p-1 mb-8">
                {plan.monthlyPrice && (
                  <button
                    type="button"
                    onClick={() => setBilling("monthly")}
                    className={`px-5 py-2 rounded-md font-heading font-black text-xs uppercase tracking-wide transition-colors ${
                      billing === "monthly" ? "bg-lime text-asphalt" : "text-white/60"
                    }`}
                  >
                    Monthly
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setBilling("annual")}
                  className={`px-5 py-2 rounded-md font-heading font-black text-xs uppercase tracking-wide transition-colors ${
                    billing === "annual" ? "bg-lime text-asphalt" : "text-white/60"
                  }`}
                >
                  Annual · Save
                </button>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-ui text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — form */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-baseline gap-2 mb-1">
                {coupon && <span className="text-steel font-ui text-lg line-through">{formatINR(price)}</span>}
                <span className="font-heading font-black text-4xl text-white">
                  {formatINR(coupon ? coupon.finalAmount : price)}
                </span>
                <span className="text-steel font-ui text-sm">
                  /{billing === "annual" ? "year" : "month"}
                </span>
              </div>
              {monthlyEquivalent && (
                <p className="text-xs text-lime font-ui mb-6">
                  ≈ {formatINR(monthlyEquivalent)}/mo billed annually
                </p>
              )}
              {!monthlyEquivalent && <div className="mb-6" />}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                    placeholder="you@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Phone *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    City *
                  </label>
                  <select
                    {...register("city")}
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors appearance-none"
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <CouponField source="membership" amount={price} applied={coupon} onApply={setCoupon} onClear={() => setCoupon(null)} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : `Join — ${formatINR(coupon ? coupon.finalAmount : price)}`}
                </button>
                <p className="text-center text-xs text-steel font-ui">
                  Secure payment by Razorpay · Cancel anytime
                </p>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <a
                  href={buildWhatsAppLink(WA_MESSAGES.membershipEnquiry(plan.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-ui text-steel hover:text-lime transition-colors"
                >
                  Questions? Ask on WhatsApp →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
