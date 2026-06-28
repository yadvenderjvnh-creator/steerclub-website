import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { events, eventRegistrations, users } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { formatINR } from "@/lib/utils";
import { EventRoster, type RegRow } from "./event-roster";

export const dynamic = "force-dynamic";

export default async function EventRosterPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("community.write");
  const { id } = await params;

  const [ev] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!ev) notFound();

  const regs = await db
    .select({
      id: eventRegistrations.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      city: users.city,
      status: eventRegistrations.status,
      amount: eventRegistrations.amount,
      attended: eventRegistrations.attended,
      createdAt: eventRegistrations.createdAt,
    })
    .from(eventRegistrations)
    .innerJoin(users, eq(eventRegistrations.userId, users.id))
    .where(eq(eventRegistrations.eventId, id))
    .orderBy(desc(eventRegistrations.createdAt));

  const rows: RegRow[] = regs.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    city: r.city,
    status: r.status,
    amount: r.amount ?? 0,
    attended: r.attended,
  }));

  const confirmed = rows.filter((r) => r.status === "confirmed").length;

  return (
    <div>
      <Link href="/admin/community" className="text-steel hover:text-white font-ui text-xs uppercase tracking-widest">← Community</Link>
      <div className="my-6">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2 capitalize">{ev.type.replace("-", " ")} · {ev.city}</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">{ev.title}</h1>
        <p className="text-steel text-sm font-ui mt-1">
          {new Date(ev.eventDate).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })} · {ev.location}
          {" · "}{confirmed}/{ev.capacity} confirmed{(ev.price ?? 0) > 0 ? ` · ${formatINR(ev.price ?? 0)}` : " · Free"}
        </p>
      </div>
      <EventRoster eventTitle={ev.title} rows={rows} />
    </div>
  );
}
