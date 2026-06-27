"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  ClipboardList,
  CreditCard,
  BookOpen,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/coaches", label: "Coaches", icon: UserCog },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

const COACH_NAV = [
  { href: "/admin/coach", label: "My Sessions", icon: CalendarCheck, exact: true },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const NAV = user.role === "coach" ? COACH_NAV : ADMIN_NAV;

  const navLinks = NAV.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-ui transition-colors",
          active
            ? "bg-lime/10 text-lime"
            : "text-white/60 hover:text-white hover:bg-white/5"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-asphalt text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col border-r border-white/10 min-h-screen sticky top-0 h-screen p-4">
          <Link href="/admin" className="px-2 mb-8 block">
            <span className="font-heading font-black text-xl tracking-tight text-white">
              STEER<span className="text-lime">CLUB</span>
            </span>
            <span className="block text-[10px] tracking-[0.3em] text-steel font-ui mt-1">
              ADMIN
            </span>
          </Link>
          <nav className="space-y-1 flex-1">{navLinks}</nav>
          <div className="border-t border-white/10 pt-4">
            <p className="px-2 text-sm text-white truncate">{user.name}</p>
            <p className="px-2 text-xs text-steel truncate mb-3 capitalize">
              {user.email} · {user.role}
            </p>
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
                <span className="text-[10px] tracking-[0.3em] text-steel font-ui ml-2">ADMIN</span>
              </span>
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="text-steel hover:text-red-300">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-2 pb-2">{navLinks}</nav>
          </header>

          <main className="p-5 lg:p-8 max-w-[1400px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
