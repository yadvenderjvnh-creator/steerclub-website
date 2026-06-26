import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Gauge, BookOpen, Trophy, Calendar } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const NAV_ITEMS = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/score", label: "My Score", icon: Gauge },
    { href: "/dashboard/programs", label: "Programs", icon: BookOpen },
    { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
  ];

  return (
    <div className="pt-20 min-h-screen bg-asphalt">
      <div className="container max-w-[1440px] py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="glass rounded-xl p-3 space-y-1 sticky top-24">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-ui text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
