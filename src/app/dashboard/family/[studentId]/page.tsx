import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { assertParentAccess, getStudentUser } from "@/lib/portal/parent";
import { getLatestScore, getUserPrograms, getUserSessions, getUserPayments, deriveRating } from "@/lib/portal/queries";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FamilyStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const parent = await requireUser();
  const { studentId } = await params;
  if (parent.role !== "parent") redirect("/dashboard");
  if (!(await assertParentAccess(parent.id, studentId))) notFound();

  const student = await getStudentUser(studentId);
  if (!student) notFound();
  const su = { id: student.id, email: student.email };

  const [{ latest }, programs, sessions, payments] = await Promise.all([
    getLatestScore(su),
    getUserPrograms(su),
    getUserSessions(su),
    getUserPayments(su),
  ]);

  const rating = latest ? deriveRating(latest.total) : null;
  const upcoming = sessions.filter((s) => new Date(s.scheduledAt) >= new Date());
  const attended = sessions.filter((s) => s.attendanceStatus === "present").length;
  const totalPaid = payments.filter((p) => p.status === "confirmed" || p.status === "completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/family" className="text-steel hover:text-white font-ui text-xs uppercase tracking-widest inline-flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Family</Link>
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Read-only</p>
        <h1 className="font-heading font-black text-2xl text-white uppercase">{student.name}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Steer Score</p>
          <p className="font-heading font-black text-2xl text-white">{latest ? latest.total : "—"}</p>
          {rating && <p className={`text-xs font-ui ${rating.color}`}>{rating.label}</p>}
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Programs</p>
          <p className="font-heading font-black text-2xl text-white">{programs.length}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Sessions attended</p>
          <p className="font-heading font-black text-2xl text-white">{attended}<span className="text-steel text-sm">/{sessions.length}</span></p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs font-ui uppercase tracking-widest text-steel mb-2">Total paid</p>
          <p className="font-heading font-black text-2xl text-white">{formatINR(totalPaid)}</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Upcoming sessions</h2>
        {upcoming.length === 0 ? <p className="text-steel font-ui text-sm">None scheduled.</p> : (
          <div className="divide-y divide-white/5">
            {upcoming.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div><p className="text-white font-ui text-sm">{s.programName} · Session {s.sessionNo}</p><p className="text-steel text-xs">{s.location ?? s.city}</p></div>
                <span className="text-steel text-xs font-ui">{new Date(s.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-4">Programs</h2>
        {programs.length === 0 ? <p className="text-steel font-ui text-sm">No programs yet.</p> : (
          <div className="divide-y divide-white/5">
            {programs.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <span className="text-white font-ui text-sm">{p.programName ?? "Program"}</span>
                <span className="text-steel text-xs font-ui capitalize">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
