"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Score",
    href: "/score",
    children: [
      { label: "How It Works", href: "/score/how-it-works", desc: "What the Steer Score measures" },
      { label: "Book Assessment", href: "/score/book", desc: "₹299 · 30 min · Any city" },
      { label: "My Score", href: "/dashboard/score", desc: "View your score history" },
    ],
  },
  {
    label: "Programs",
    href: "/programs",
    children: [
      { label: "Confidence Foundation™", href: "/programs/confidence-foundation", desc: "Score 0–50 · 4 sessions" },
      { label: "City Mastery™", href: "/programs/city-mastery", desc: "Score 45+ · 5 sessions" },
      { label: "Highway Freedom™", href: "/programs/highway-freedom", desc: "Score 55+ · 4 sessions" },
      { label: "All Conditions™", href: "/programs/all-conditions", desc: "Score 55+ · 4 sessions" },
      { label: "Roadtrip Ready™", href: "/programs/roadtrip-ready", desc: "Score 60+ · 5 sessions" },
    ],
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "City Chapters", href: "/community", desc: "Find your city's chapter" },
      { label: "Member Stories", href: "/community/member-stories", desc: "Real scores. Real roads." },
      { label: "Road Notes", href: "/road-notes", desc: "India's driving knowledge base" },
      { label: "Score Wall", href: "/community/wall", desc: "Public achievements" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "City Drives", href: "/events?type=city-drive", desc: "Monthly casual drives" },
      { label: "Skill Workshops", href: "/events?type=workshop", desc: "Member-exclusive" },
      { label: "Road Trips", href: "/events?type=road-trip", desc: "Multi-day experiences" },
      { label: "Track Days", href: "/events?type=track-day", desc: "Pro & Select members" },
    ],
  },
  {
    label: "Membership",
    href: "/membership",
    children: [
      { label: "Compare Plans", href: "/membership", desc: "Free · Member · Pro · Select" },
      { label: "Steer Member", href: "/membership#member", desc: "₹799/mo" },
      { label: "Steer Pro", href: "/membership#pro", desc: "₹1,999/mo" },
      { label: "Steer Select", href: "/membership#select", desc: "₹49,999/yr · Limited" },
    ],
  },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-dark py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container max-w-[1440px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading font-black text-xl tracking-[0.08em] uppercase"
          onClick={() => setOpen(false)}
        >
          Steer<span className="text-lime">Club</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setActiveMenu(item.label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-ui font-medium transition-colors",
                  activeMenu === item.label ? "text-lime" : "text-white/70 hover:text-white"
                )}
              >
                {item.label}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    activeMenu === item.label && "rotate-180"
                  )}
                />
              </Link>

              <AnimatePresence>
                {activeMenu === item.label && item.children && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64"
                  >
                    <div className="glass rounded-xl overflow-hidden py-2 shadow-2xl">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex flex-col px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-sm font-ui font-medium text-white">{child.label}</span>
                          <span className="text-xs text-steel mt-0.5">{child.desc}</span>
                        </Link>
                      ))}
                      {item.label === "Programs" && (
                        <div className="mx-4 mt-2 pt-2 border-t border-white/10">
                          <Link
                            href="/score/book"
                            className="text-xs text-steel hover:text-lime transition-colors"
                          >
                            Not sure? Take your Steer Score first →
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-ui text-white/60 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/score/book"
            className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-5 py-2.5 hover:bg-lime/90 transition-all duration-200 hover:scale-[1.02]"
          >
            Take Your Score →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass-dark border-t border-white/10 overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-ui font-medium text-white/80 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4 space-y-1 pb-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-steel hover:text-white transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 pb-2">
                <Link
                  href="/score/book"
                  className="block w-full text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4"
                  onClick={() => setOpen(false)}
                >
                  Take Your Score →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
