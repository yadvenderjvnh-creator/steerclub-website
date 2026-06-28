"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Route,
  Gauge,
  GraduationCap,
  CalendarDays,
  CreditCard,
  Trophy,
  Users,
  Gift,
  HeartHandshake,
  User,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/journey", label: "My Journey", icon: Route },
  { href: "/dashboard/score", label: "My Score", icon: Gauge },
  { href: "/dashboard/programs", label: "Programs", icon: GraduationCap },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Gift },
  { href: "/dashboard/family", label: "Family", icon: HeartHandshake },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

// Parents get a trimmed, read-only nav.
const PARENT_NAV = [
  { href: "/dashboard/family", label: "Family", icon: HeartHandshake, exact: false },
  { href: "/dashboard/profile", label: "Profile", icon: User, exact: false },
];

export function PortalShell({
  user,
  unreadCount,
  children,
}: {
  user: { name: string; email: string; role?: string };
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = user.role === "parent" ? PARENT_NAV : NAV;

  const navLinks = items.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui transition-colors whitespace-nowrap",
          active ? "bg-lime/10 text-lime" : "text-white/60 hover:text-white hover:bg-white/5"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  });

  const bell = (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-lime hover:bg-white/5 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-lime text-asphalt text-[10px] font-heading font-black flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-asphalt text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col border-r border-white/10 min-h-screen sticky top-0 h-screen p-4">
          <Link href="/dashboard" className="px-2 mb-8 block">
            <span className="font-heading font-black text-xl tracking-tight text-white">
              STEER<span className="text-lime">CLUB</span>
            </span>
            <span className="block text-[10px] tracking-[0.3em] text-steel font-ui mt-1">MEMBER</span>
          </Link>
          <nav className="space-y-1 flex-1">{navLinks}</nav>
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{user.name}</p>
                <p className="text-xs text-steel truncate">{user.email}</p>
              </div>
              {bell}
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-ui text-white/60 hover:text-red-300 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0">
          {/* Mobile topbar + nav */}
          <header className="lg:hidden sticky top-0 z-30 bg-asphalt/95 backdrop-blur border-b border-white/10">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-heading font-black text-lg text-white">
                STEER<span className="text-lime">CLUB</span>
                <span className="text-[10px] tracking-[0.3em] text-steel font-ui ml-2">MEMBER</span>
              </span>
              <div className="flex items-center gap-1">
                {bell}
                <form action="/api/auth/signout" method="post">
                  <button type="submit" className="text-steel hover:text-red-300 p-2">
                    <LogOut className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-2 pb-2">{navLinks}</nav>
          </header>

          <main className="p-5 lg:p-8 max-w-[1200px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
