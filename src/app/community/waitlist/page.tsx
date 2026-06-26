"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CITIES } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  city: z.string().min(1, "Select your city"),
});

type WaitlistForm = z.infer<typeof schema>;

export default function CommunityWaitlistPage() {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WaitlistForm>({ resolver: zodResolver(schema) });

  async function onSubmit(data: WaitlistForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "chapter", source: "community-waitlist" }),
      });
      if (res.ok) setJoined(true);
      else alert("Something went wrong. Please try again.");
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-asphalt flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-lime" />
          </div>
          <h1 className="font-heading font-black text-3xl text-white uppercase mb-3">
            You&apos;re on the list.
          </h1>
          <p className="text-white/60 font-body mb-8">
            We&apos;ll let you know the moment a SteerClub chapter opens in your city. In the
            meantime — find out where you stand.
          </p>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
          >
            Take Your Score — ₹299
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asphalt pt-24 pb-24">
      <div className="container max-w-[1440px]">
        <div className="max-w-xl mx-auto">
          <Link
            href="/community"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← Community
          </Link>

          <div className="mb-10">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
              Chapter Waitlist
            </p>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-white uppercase mb-4">
              Bring SteerClub
              <br />
              to your city.
            </h1>
            <p className="text-white/60 font-body">
              We open new chapters where there&apos;s demand. Add your name and we&apos;ll tell you
              the moment yours goes live.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  Phone (optional)
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
                  placeholder="+91 98765 43210"
                />
              </div>
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
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-5 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join the Waitlist"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
