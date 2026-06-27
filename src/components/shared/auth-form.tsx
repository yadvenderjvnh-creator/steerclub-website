"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Mail } from "lucide-react";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
});

type AuthFormValues = z.infer<typeof schema>;

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: AuthFormValues) {
    setLoading(true);
    try {
      // Sends a magic sign-in link to the user's email.
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, mode, next }),
      });
      const json = await res.json().catch(() => ({}));
      // In development the link is returned so the flow works without an email provider.
      if (json?.devLink) {
        window.location.href = json.devLink;
        return;
      }
      setSentTo(data.email);
      setSent(true);
    } catch {
      // Even on failure we show the same screen — never reveal whether an account exists.
      setSentTo(data.email);
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-lime" />
        </div>
        <h2 className="font-heading font-black text-xl text-white uppercase mb-2">
          Check your email
        </h2>
        <p className="text-white/60 font-body text-sm">
          We sent a secure sign-in link to{" "}
          <span className="text-white">{sentTo}</span>. Click it to continue — the link expires in
          15 minutes.
        </p>
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-steel font-ui">
          <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
          No password needed
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === "sign-up" && (
        <div>
          <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
            Full Name
          </label>
          <input
            {...register("name")}
            className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-ui uppercase tracking-widest text-steel mb-2">
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
          placeholder="you@email.com"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-lime text-asphalt font-heading font-black text-base tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Sending..."
          : mode === "sign-in"
            ? "Send Sign-In Link"
            : "Create Account"}
      </button>

      <p className="text-center text-xs text-steel font-ui">
        We&apos;ll email you a secure link — no password to remember.
      </p>
    </form>
  );
}
