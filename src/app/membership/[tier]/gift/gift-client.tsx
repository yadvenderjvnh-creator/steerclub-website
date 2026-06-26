"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2, Gift } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import type { MembershipPlan } from "@/types";

const schema = z.object({
  buyerName: z.string().min(2, "Your name is required"),
  buyerEmail: z.string().email("Valid email required"),
  buyerPhone: z.string().min(10, "Valid phone number required"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientEmail: z.string().email("Valid recipient email required"),
  message: z.string().optional(),
  deliverOn: z.string().optional(),
});

type GiftForm = z.infer<typeof schema>;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function MembershipGiftClient({ plan }: { plan: MembershipPlan }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const price = plan.annualPrice;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GiftForm>({ resolver: zodResolver(schema) });

  async function onSubmit(data: GiftForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gift",
          giftType: "membership",
          tier: plan.tier,
          customerData: data,
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
          description: `Gift — ${plan.name} (annual)`,
          image: "/logo.png",
          prefill: {
            name: data.buyerName,
            email: data.buyerEmail,
            contact: data.buyerPhone,
          },
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
                type: "gift",
                giftType: "membership",
                tier: plan.tier,
                bookingData: data,
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
            Gift Sent.
          </h1>
          <p className="text-white/60 font-body mb-8">
            A beautifully designed gift email with the {plan.name} code is on its way to your
            recipient. You&apos;ll get a confirmation receipt by email too.
          </p>
          <Link
            href="/"
            className="block w-full bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
          >
            Back to SteerClub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pt-24 pb-24">
      <div className="container max-w-[1440px]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/gift"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← All Gifts
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-lime" />
            </div>
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase">
              Gift a Membership
            </p>
          </div>
          <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-3">
            {plan.name}
          </h1>
          <p className="text-white/60 font-body text-lg mb-2">{plan.tagline}</p>
          <p className="font-heading font-black text-2xl text-white mb-10">
            {formatINR(price)} <span className="text-steel text-sm font-ui">/ year</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Recipient */}
            <div>
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide mb-4">
                Who&apos;s it for?
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                      Recipient Name *
                    </label>
                    <input
                      {...register("recipientName")}
                      className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                      placeholder="Their name"
                    />
                    {errors.recipientName && (
                      <p className="text-red-400 text-xs mt-1">{errors.recipientName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                      Recipient Email *
                    </label>
                    <input
                      {...register("recipientEmail")}
                      type="email"
                      className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                      placeholder="them@email.com"
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-400 text-xs mt-1">{errors.recipientEmail.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Personal Message (optional)
                  </label>
                  <textarea
                    {...register("message")}
                    rows={3}
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel resize-none"
                    placeholder="Add a note to your gift..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Deliver On (optional)
                  </label>
                  <input
                    {...register("deliverOn")}
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div>
              <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide mb-4">
                Your details
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                      Your Name *
                    </label>
                    <input
                      {...register("buyerName")}
                      className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                      placeholder="Your name"
                    />
                    {errors.buyerName && (
                      <p className="text-red-400 text-xs mt-1">{errors.buyerName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                      Your Phone *
                    </label>
                    <input
                      {...register("buyerPhone")}
                      type="tel"
                      className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                      placeholder="+91 98765 43210"
                    />
                    {errors.buyerPhone && (
                      <p className="text-red-400 text-xs mt-1">{errors.buyerPhone.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                    Your Email *
                  </label>
                  <input
                    {...register("buyerEmail")}
                    type="email"
                    className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                    placeholder="you@email.com"
                  />
                  {errors.buyerEmail && (
                    <p className="text-red-400 text-xs mt-1">{errors.buyerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="glass rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-heading font-black text-white">{plan.name} — Gift</p>
                <p className="text-xs text-steel font-ui mt-0.5">1 year · delivered by email</p>
              </div>
              <p className="font-heading font-black text-2xl text-white">{formatINR(price)}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-5 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Send This Gift — ${formatINR(price)}`}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <a
              href={buildWhatsAppLink(WA_MESSAGES.giftEnquiry())}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-ui text-steel hover:text-lime transition-colors"
            >
              Prefer to arrange it over WhatsApp? →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
