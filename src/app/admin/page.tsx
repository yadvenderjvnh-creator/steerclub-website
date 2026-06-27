import { and, gte, eq, desc, inArray, sql, count } from "drizzle-orm";
import {
  CalendarCheck,
  IndianRupee,
  Users,
  AlertCircle,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  assessmentBookings,
  programBookings,
  leads,
  users,
  events,
  activityLog,
} from "@/lib/db/schema";
import { StatCard } from "@/components/admin/stat-card";
import { formatINR } from "@/lib/utils";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const PAID = ["confirmed", "completed"] as const;

async function sumAmount(
  table: typeof assessmentBookings | typeof programBookings,
  from?: Date
) {
  const conds = [inArray(table.status, [...PAID])];
  if (from) conds.push(gte(table.createdAt, from));
  const [r] = await db
    .select({ s: sql<number>`coalesce(sum(${table.amount}),0)::int` })
    .from(table)
    .where(and(...conds));
  return r?.s ?? 0;
}

async function pendingAmount(table: typeof assessmentBookings | typeof programBookings) {
  const [r] = await db
    .select({ s: sql<number>`coalesce(sum(${table.amount}),0)::int` })
    .from(table)
    .where(eq(table.status, "pending"));
  return r?.s ?? 0;
}

export default async function AdminDashboard() {
  await requireRole(["admin"]);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000);

  const [
    asmtToday,
    progToday,
    revTodayA,
    revTodayP,
    revMtdA,
    revMtdP,
    outA,
    outP,
    newLeads,
    activeStudents,
    upcomingEvents,
    recent,
  ] = await Promise.all([
    db.select({ c: count() }).from(assessmentBookings).where(gte(assessmentBookings.createdAt, startToday)),
    db.select({ c: count() }).from(programBookings).where(gte(programBookings.createdAt, startToday)),
    sumAmount(assessmentBookings, startToday),
    sumAmount(programBookings, startToday),
    sumAmount(assessmentBookings, startMonth),
    sumAmount(programBookings, startMonth),
    pendingAmount(assessmentBookings),
    pendingAmount(programBookings),
    db.select({ c: count() }).from(leads).where(gte(leads.createdAt, sevenDaysAgo)),
    db.select({ c: count() }).from(users).where(eq(users.role, "client")),
    db.select({ c: count() }).from(events).where(and(eq(events.isPublished, true), gte(events.eventDate, now))),
    db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        entity: activityLog.entity,
        createdAt: activityLog.createdAt,
        actorName: users.name,
      })
      .from(activityLog)
      .leftJoin(users, eq(activityLog.actorId, users.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(10),
  ]);

  const bookingsToday = (asmtToday[0]?.c ?? 0) + (progToday[0]?.c ?? 0);
  const revenueToday = revTodayA + revTodayP;
  const revenueMtd = revMtdA + revMtdP;
  const outstanding = outA + outP;

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Executive Dashboard
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Bookings Today" value={bookingsToday} icon={CalendarCheck} accent />
        <StatCard label="Revenue Today" value={formatINR(revenueToday)} icon={IndianRupee} accent />
        <StatCard label="Revenue (MTD)" value={formatINR(revenueMtd)} icon={IndianRupee} />
        <StatCard label="Outstanding" value={formatINR(outstanding)} sub="pending bookings" icon={AlertCircle} />
        <StatCard label="New Leads (7d)" value={newLeads[0]?.c ?? 0} icon={Users} />
        <StatCard label="Active Students" value={activeStudents[0]?.c ?? 0} icon={GraduationCap} />
        <StatCard label="Upcoming Events" value={upcomingEvents[0]?.c ?? 0} icon={CalendarDays} />
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">
          Recent Activity
        </h2>
        {recent.length === 0 ? (
          <p className="text-steel font-ui text-sm">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
                <span className="text-white/80 font-ui">{a.action}</span>
                <span className="text-steel font-ui">· {a.entity}</span>
                <span className="text-steel font-ui ml-auto text-xs">
                  {a.actorName ?? "system"} ·{" "}
                  {new Date(a.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
