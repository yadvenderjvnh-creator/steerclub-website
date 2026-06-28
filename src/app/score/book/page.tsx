"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Lock, Clock, RotateCcw } from "lucide-react";
import { CITIES, formatINR } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { CouponField, type AppliedCoupon } from "@/components/checkout/coupon-field";

const ASSESSMENT_PRICE = 29900;

const bookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  city: z.string().min(1, "Select your city"),
  preferredDate: z.string().optional(),
  carOwned: z.boolean().default(true),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

type Step = "details" | "payment" | "confirmed";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export default function BookAssessmentPage() {
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingForm | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingForm>({ resolver: zodResolver(bookingSchema), defaultValues: { carOwned: true } });

  const watchedName = watch("name");

  async function onSubmit(data: BookingForm) {
    setLoading(true);
    setBookingData(data);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "assessment", customerData: data, couponCode: coupon?.code }),
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
          description: "Steer Score Assessment",
          image: "/logo.png",
          prefill: { name: data.name, email: data.email, contact: data.phone },
          theme: { color: "#D7FF2F" },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, type: "assessment", bookingData: data, couponCode: coupon?.code, couponDiscount: coupon?.discount }),
            });
            if (verify.ok) setStep("confirmed");
          },
        });
        rzp.open();
      };
    } catch {
      alert("Something went wrong. Please try WhatsApp booking below.");
    }
    setLoading(false);
  }

  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-asphalt flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-lime" />
          </div>
          <h1 className="font-heading font-black text-3xl text-white uppercase mb-3">
            Assessment Booked.
          </h1>
          <p className="text-white/60 font-body mb-6">
            You'll receive a WhatsApp message and email confirmation within 2 hours with your
            instructor's name, location, and what to expect.
          </p>
          <div className="glass rounded-xl p-6 text-left mb-6 space-y-3">
            {[
              "30-minute in-vehicle assessment",
              "Your instructor will contact you to confirm time and location",
              "No preparation needed — just drive how you normally drive",
              "Score report shared immediately after assessment",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 font-body">{item}</p>
              </div>
            ))}
          </div>
          <a
            href={buildWhatsAppLink(WA_MESSAGES.bookAssessment(bookingData?.name))}
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
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
              Steer Score Assessment
            </p>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-4">
              Book Your
              <br />
              Assessment
            </h1>
            <p className="text-white/60 font-body">
              30 minutes in-vehicle. Certified instructor. Your honest score.
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-6 mb-10 pb-8 border-b border-white/10">
            {[
              { icon: Clock, label: "30 min · Score same day" },
              { icon: Lock, label: "Score shared only with you" },
              { icon: RotateCcw, label: "Free cancellation 24h before" },
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

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                Your City *
              </label>
              <select
                {...register("city")}
                className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors appearance-none"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
                Preferred Date (optional)
              </label>
              <input
                {...register("preferredDate")}
                type="date"
                className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register("carOwned")}
                type="checkbox"
                id="carOwned"
                className="w-4 h-4 accent-lime"
              />
              <label htmlFor="carOwned" className="text-sm text-white/70 font-ui">
                I have access to a car for the assessment
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
                placeholder="e.g. I haven't driven in a year, I have anxiety about parking..."
              />
            </div>

            {/* Coupon */}
            <CouponField source="assessment" amount={ASSESSMENT_PRICE} applied={coupon} onApply={setCoupon} onClear={() => setCoupon(null)} />

            {/* Price summary */}
            <div className="glass rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-heading font-black text-white">Steer Score Assessment</p>
                <p className="text-xs text-steel font-ui mt-0.5">30 min · Full score report · Instructor debrief</p>
              </div>
              <div className="text-right">
                {coupon && <p className="text-xs text-steel font-ui line-through">{formatINR(ASSESSMENT_PRICE)}</p>}
                <p className="font-heading font-black text-2xl text-white">{formatINR(coupon ? coupon.finalAmount : ASSESSMENT_PRICE)}</p>
                {coupon ? <p className="text-xs text-lime font-ui">Coupon {coupon.code} applied</p> : <p className="text-xs text-steel font-ui">incl. GST</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-5 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Proceed to Payment — ${formatINR(coupon ? coupon.finalAmount : ASSESSMENT_PRICE)}`}
            </button>

            <p className="text-center text-xs text-steel font-ui">
              Secure payment by Razorpay · UPI / Card / Wallet accepted
            </p>
          </form>

          {/* WhatsApp alternative */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-xs text-steel font-ui mb-3">Prefer to book via WhatsApp?</p>
            <a
              href={buildWhatsAppLink(WA_MESSAGES.bookAssessment(watchedName))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-ui text-sm px-6 py-3 hover:border-white/40 transition-colors"
            >
              Book on WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
