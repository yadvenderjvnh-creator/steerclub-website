import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, GraduationCap, User, ArrowRight, Bell } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getLatestScore,
  getProfile,
  profileCompletion,
  deriveRating,
  getNotifications,
  getUserPrograms,
} from "@/lib/portal/queries";

export const metadata: Metadata = { title: "Dashboard — SteerClub" };
export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const user = await requireUser();
  const [{ latest }, profile, notifs, programs] = await Promise.all([
    getLatestScore(user),
    getProfile(user.id),
    getNotifications(user.id),
    getUserPrograms(user),
  ]);

  const completion = profileCompletion(profile as Record<string, unknown> | null);
  const rating = latest ? deriveRating(latest.total) : null;
  const activeProgram = programs.find((p) => p.status === "confirmed" || p.status === "pending");
  const firstName = user.name.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Welcome back
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Hi, {firstName}</h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Steer Rating */}
        <Link href="/dashboard/score" className="glass rounded-xl p-5 hover:border-lime/20 border border-transparent transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-ui uppercase tracking-widest text-steel">Steer Rating</p>
            <Gauge className="w-4 h-4 text-lime" />
          </div>
          {latest ? (
            <>
              <p className="font-heading font-black text-3xl text-white">
                {latest.total}
                <span className="text-base text-steel"> / 100</span>
              </p>
              <p className={`text-xs font-heading font-black uppercase mt-1 ${rating!.color}`}>
                {rating!.label}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading font-black text-xl text-white">No score yet</p>
              <p className="text-xs text-lime font-ui mt-1">Book your assessment →</p>
            </>
          )}
        </Link>

        {/* Profile completion */}
        <Link href="/dashboard/profile" className="glass rounded-xl p-5 hover:border-lime/20 border border-transparent transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-ui uppercase tracking-widest text-steel">Profile</p>
            <User className="w-4 h-4 text-steel" />
          </div>
          <p className="font-heading font-black text-3xl text-white">{completion}%</p>
          <div className="h-1.5 bg-graphite rounded-full overflow-hidden mt-2">
            <div className="h-full bg-lime rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </Link>

        {/* Current program */}
        <Link href="/dashboard/programs" className="glass rounded-xl p-5 hover:border-lime/20 border border-transparent transition-all">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-ui uppercase tracking-widest text-steel">Current Program</p>
            <GraduationCap className="w-4 h-4 text-steel" />
          </div>
          {activeProgram ? (
            <>
              <p className="font-heading font-black text-lg text-white uppercase leading-tight">
                {activeProgram.programName ?? "Program"}
              </p>
              <p className="text-xs text-steel font-ui mt-1 capitalize">{activeProgram.status}</p>
            </>
          ) : (
            <>
              <p className="font-heading font-black text-lg text-white uppercase">None active</p>
              <p className="text-xs text-lime font-ui mt-1">Browse programs →</p>
            </>
          )}
        </Link>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: latest ? "Re-take Assessment" : "Take Your Score", href: "/score/book" },
            { label: "Browse Programs", href: "/programs" },
            { label: "Complete Profile", href: "/dashboard/profile" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="glass rounded-xl p-5 flex items-center justify-between hover:border-lime/20 border border-transparent transition-all group"
            >
              <span className="font-heading font-black text-sm text-white uppercase">{a.label}</span>
              <ArrowRight className="w-4 h-4 text-lime group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent notifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-black text-sm text-white uppercase tracking-wide">Recent</h2>
          <Link href="/dashboard/notifications" className="text-xs font-ui text-lime hover:underline">
            View all
          </Link>
        </div>
        {notifs.length === 0 ? (
          <div className="glass rounded-xl p-6 flex items-center gap-3 text-steel">
            <Bell className="w-4 h-4" />
            <p className="font-ui text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="glass rounded-xl divide-y divide-white/5">
            {notifs.slice(0, 4).map((n) => (
              <div key={n.id} className="p-4 flex items-start gap-3">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.readAt ? "bg-steel" : "bg-lime"}`} />
                <div className="min-w-0">
                  <p className="text-sm text-white font-ui">{n.title}</p>
                  {n.body && <p className="text-xs text-steel font-ui mt-0.5">{n.body}</p>}
                </div>
                <span className="text-[11px] text-steel font-ui ml-auto whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
