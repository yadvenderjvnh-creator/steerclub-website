import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, waitlist, leadActivities, users } from "@/lib/db/schema";
import { LeadsManager, type LeadRow, type WaitlistRow } from "./leads-manager";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  await requireRole(["admin"]);
  const [leadRows, waitlistRows, activities] = await Promise.all([
    db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        phone: leads.phone,
        city: leads.city,
        source: leads.source,
        status: leads.status,
        stage: leads.stage,
        notes: leads.notes,
        nextFollowUpAt: leads.nextFollowUpAt,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .orderBy(desc(leads.createdAt)),
    db.select().from(waitlist).orderBy(desc(waitlist.createdAt)),
    db
      .select({
        id: leadActivities.id,
        leadId: leadActivities.leadId,
        type: leadActivities.type,
        note: leadActivities.note,
        createdAt: leadActivities.createdAt,
        actorName: users.name,
      })
      .from(leadActivities)
      .leftJoin(users, eq(leadActivities.createdById, users.id))
      .orderBy(desc(leadActivities.createdAt)),
  ]);

  const leadData: LeadRow[] = leadRows.map((l) => ({
    ...l,
    nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    activities: activities
      .filter((a) => a.leadId === l.id)
      .map((a) => ({
        id: a.id,
        type: a.type,
        note: a.note,
        actorName: a.actorName,
        createdAt: a.createdAt.toISOString(),
      })),
  }));

  const waitlistData: WaitlistRow[] = waitlistRows.map((w) => ({
    id: w.id,
    name: w.name,
    email: w.email,
    phone: w.phone,
    city: w.city,
    type: w.type,
    source: w.source,
    createdAt: w.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Mini-CRM
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Leads</h1>
      </div>
      <LeadsManager leads={leadData} waitlist={waitlistData} />
    </div>
  );
}
