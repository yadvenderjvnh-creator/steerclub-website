import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getLinkedStudents, getLinkedParents } from "@/lib/portal/parent";
import { FamilyInvite } from "./family-invite";

export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const user = await requireUser("/dashboard/family");

  if (user.role === "parent") {
    const students = await getLinkedStudents(user.id);
    return (
      <div className="space-y-6">
        <div>
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Family</p>
          <h1 className="font-heading font-black text-2xl text-white uppercase">Following</h1>
          <p className="text-steel text-sm font-ui mt-1">Read-only view of the drivers who added you.</p>
        </div>
        {students.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center text-steel font-ui text-sm">
            No one has linked you yet. Ask them to add your email from their SteerClub dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((s) => (
              <Link key={s.studentId} href={`/dashboard/family/${s.studentId}`} className="glass rounded-xl p-5 flex items-center justify-between hover:border-lime/20 border border-transparent">
                <div>
                  <p className="text-white font-heading font-black uppercase">{s.name}</p>
                  <p className="text-steel text-xs font-ui">{s.relationship ?? "Driver"}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-lime" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Student/member view: invite + manage parents.
  const parents = await getLinkedParents(user.id);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Family</p>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Share your progress</h1>
        <p className="text-steel text-sm font-ui mt-1">Invite a parent or guardian to follow your score, sessions and payments — read-only.</p>
      </div>
      <FamilyInvite parents={parents.map((p) => ({ parentId: p.parentId, name: p.name, email: p.email, relationship: p.relationship }))} />
    </div>
  );
}
