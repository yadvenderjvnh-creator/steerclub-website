"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Lock, Users, RotateCcw } from "lucide-react";
import { CITIES, formatINR } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import type { Program } from "@/types";

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  city: z.string().min(1, "Select your city"),
  steerScore: z.string().optional(),
  isMember: z.boolean().default(false),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function ProgramBookingClient({ program }: { program: Program }) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingForm | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { isMember: false },
  });

  const isMember = watch("isMember");
  const watchedName = watch("name");
  const activePrice = isMember ? program.memberPrice : program.price;

  async function onSubmit(data: BookingForm) {
    setLoading(true);
    setBookingData(data);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "program",
          programSlug: program.slug,
          isMember: data.isMember,
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
          description: program.name,
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
                type: "program",
                programSlug: program.slug,
                bookingData: data,
              }),
            });
            if (verify.ok) setConfirmed(true);
          },
        });
        rzp.open();
      };
    } catch {
      alert("Something went wrong. Please try WhatsApp booking below.");
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
            Seat Reserved.
          </h1>
          <p className="text-white/60 font-body mb-6">
            You&apos;re booked into the next{" "}
            <span className="text-white">{program.name}</span> cohort. We&apos;ll confirm your exact
            schedule and instructor by WhatsApp and email within 24 hours.
          </p>
          <div className="glass rounded-xl p-6 text-left mb-6 space-y-3">
            {[
              `${program.sessions} sessions · ${program.durationHours} hours total`,
              "Cohort schedule confirmed at least 7 days before start",
              "Your instructor introduced 48 hours before session one",
              "Progress tracked on your dashboard",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 font-body">{item}</p>
              </div>
            ))}
          </div>
          <a
            href={buildWhatsAppLink(WA_MESSAGES.bookProgram(program.name))}
            className="block w-full bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
          >
            Message Us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pt-24 pb-24">
      <div className="container max-w-[1440px]">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
                Score {program.scoreRange[0]}–{program.scoreRange[1]}
              </span>
              <span className="text-xs font-ui text-steel bg-white/5 px-3 py-1 rounded">
                {program.sessions} sessions · {program.durationHours}h
              </span>
            </div>
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
              Reserve Your Seat
            </p>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-4">
              {program.name}
            </h1>
            <p className="text-white/60 font-body italic">&ldquo;{program.tagline}&rdquo;</p>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-6 mb-10 pb-8 border-b border-white/10">
            {[
              { icon: Users, label: "Small cohort · Real cars" },
              { icon: Lock, label: "Certified instructors" },
              { icon: RotateCcw, label: "Free reschedule 7 days before" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-steel font-ui">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  Phone Number *
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                Email Address *
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                placeholder="you@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                  Your City *
                </label>
                <select
                  {...register("city")}
                  className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors appearance-none"
                >
                  <option value="">Select city</option>
                  {CITIES.filter((c) => program.cities.includes(c.value)).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                  Your Steer Score (optional)
                </label>
                <input
                  {...register("steerScore")}
                  type="number"
                  min={0}
                  max={100}
                  className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                  placeholder="e.g. 58"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register("isMember")}
                type="checkbox"
                id="isMember"
                className="w-4 h-4 accent-lime"
              />
              <label htmlFor="isMember" className="text-sm text-white/70 font-ui">
                I&apos;m a SteerClub member (apply member pricing)
              </label>
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                Anything we should know? (optional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel resize-none"
                placeholder="e.g. preferred weekdays, specific goals..."
              />
            </div>

            {/* Price summary */}
            <div className="glass rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-heading font-black text-white">{program.name}</p>
                <p className="text-xs text-steel font-ui mt-0.5">
                  {program.sessions} sessions · Full cohort · Instructor debrief
                </p>
              </div>
              <div className="text-right">
                {isMember && (
                  <p className="text-xs text-steel font-ui line-through">
                    {formatINR(program.price)}
                  </p>
                )}
                <p className="font-heading font-black text-2xl text-white">
                  {formatINR(activePrice)}
                </p>
                {isMember && (
                  <p className="text-xs text-lime font-ui">Member price</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-5 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Proceed to Payment — ${formatINR(activePrice)}`}
            </button>

            <p className="text-center text-xs text-steel font-ui">
              Secure payment by Razorpay · UPI / Card / Wallet accepted
            </p>
          </form>

          {/* WhatsApp alternative */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-steel font-ui mb-3">Questions before you book?</p>
            <a
              href={buildWhatsAppLink(WA_MESSAGES.bookProgram(program.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-ui text-sm px-6 py-3 hover:border-white/40 transition-colors"
            >
              Ask on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
