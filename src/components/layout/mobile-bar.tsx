"use client";

import Link from "next/link";
import { Phone, MessageCircle, CalendarCheck, LayoutDashboard } from "lucide-react";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function MobileBar() {
  const waLink = buildWhatsAppLink(WA_MESSAGES.bookAssessment());

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div
        className="glass-dark border-t border-white/10 grid grid-cols-4"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Call */}
        <a
          href="tel:+919876543210"
          className="flex flex-col items-center justify-center py-3 gap-1 text-white/60 hover:text-white active:text-lime transition-colors"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-ui font-medium uppercase tracking-wide">Call</span>
        </a>

        {/* WhatsApp */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 gap-1 text-white/60 hover:text-white active:text-lime transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-ui font-medium uppercase tracking-wide">WhatsApp</span>
        </a>

        {/* Book — primary action */}
        <Link
          href="/score/book"
          className="flex flex-col items-center justify-center py-3 gap-1 bg-lime text-asphalt font-heading font-black"
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wide">Book</span>
        </Link>

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center py-3 gap-1 text-white/60 hover:text-white active:text-lime transition-colors"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-ui font-medium uppercase tracking-wide">Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
