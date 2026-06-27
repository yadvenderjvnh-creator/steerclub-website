"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { rsvpEvent, cancelRsvp } from "@/app/dashboard/community-actions";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

type User = { name: string; email: string; phone: string | null };

const primary = "w-full block text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 rounded-lg hover:bg-lime/90 transition-colors disabled:opacity-60";
const ghost = "w-full block text-center border border-white/15 text-white/80 font-heading font-black text-sm uppercase py-3 rounded-lg hover:bg-white/5";

export function EventCTA({
  slug,
  title,
  price,
  memberOnly,
  full,
  isLoggedIn,
  isMember,
  registered,
  user,
}: {
  slug: string;
  title: string;
  price: number;
  memberOnly: boolean;
  full: boolean;
  isLoggedIn: boolean;
  isMember: boolean;
  registered: boolean;
  user: User | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Already registered → confirmation + (free) cancel.
  if (registered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-lime font-heading font-black text-sm uppercase">
          <CheckCircle2 className="w-5 h-5" /> You&apos;re going
        </div>
        {price === 0 && (
          <button
            onClick={() => startTransition(async () => { await cancelRsvp(slug); router.refresh(); })}
            disabled={pending}
            className={ghost}
          >
            {pending ? "…" : "Cancel RSVP"}
          </button>
        )}
        <Link href="/dashboard/community" className="block text-center text-steel text-xs font-ui hover:text-white">View in your dashboard →</Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-2">
        <Link href={`/sign-in?next=${encodeURIComponent(`/events/${slug}`)}`} className={primary}>
          Sign in to RSVP
        </Link>
        <p className="text-steel text-xs font-ui text-center">A free SteerClub account takes a minute.</p>
      </div>
    );
  }

  if (full) {
    return <div className="text-center text-orange-400 font-heading font-black text-sm uppercase py-3">This event is full</div>;
  }

  if (memberOnly && !isMember) {
    return (
      <div className="space-y-2">
        <Link href="/membership" className={primary}>Join to attend</Link>
        <p className="text-steel text-xs font-ui text-center">This is a members-only event.</p>
      </div>
    );
  }

  // Free RSVP.
  if (price === 0) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => {
            setErr(null);
            startTransition(async () => {
              const res = await rsvpEvent(slug);
              if (!res.ok) setErr(res.error ?? "Could not RSVP.");
              else router.refresh();
            });
          }}
          disabled={pending}
          className={primary}
        >
          {pending ? "…" : "RSVP — it's free"}
        </button>
        {err && <p className="text-orange-400 text-xs font-ui text-center">{err}</p>}
      </div>
    );
  }

  // Paid — Razorpay checkout.
  async function payAndRegister() {
    if (!user) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event",
          eventSlug: slug,
          customerData: { name: user.name, email: user.email, phone: user.phone },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Could not start checkout.");
        setLoading(false);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "SteerClub",
          description: title,
          image: "/logo.png",
          prefill: { name: user.name, email: user.email, contact: user.phone ?? "" },
          theme: { color: "#D7FF2F" },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                type: "event",
                bookingData: { email: user.email, name: user.name, phone: user.phone, eventSlug: slug },
              }),
            });
            if (verify.ok) router.refresh();
          },
        });
        rzp.open();
      };
    } catch {
      setErr("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button onClick={payAndRegister} disabled={loading} className={primary}>
        {loading ? "Processing…" : `Register — ${formatINR(price)}`}
      </button>
      {err && <p className="text-orange-400 text-xs font-ui text-center">{err}</p>}
      <p className="text-steel text-xs font-ui text-center">Secure payment by Razorpay</p>
    </div>
  );
}
