import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { assessmentBookings, programBookings, programs } from "@/lib/db/schema";
import { BookingsTable, type BookingRow } from "./bookings-table";
import { requirePermission } from "@/lib/auth/session";
import { branchScopeCity } from "@/lib/auth/branch";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const admin = await requirePermission("bookings.write");
  const scopeCity = await branchScopeCity(admin);
  const [asmt, progs] = await Promise.all([
    db
      .select()
      .from(assessmentBookings)
      .where(scopeCity ? sql`${assessmentBookings.city} = ${scopeCity}` : undefined)
      .orderBy(desc(assessmentBookings.createdAt)),
    db
      .select({
        id: programBookings.id,
        name: programBookings.name,
        email: programBookings.email,
        phone: programBookings.phone,
        city: programBookings.city,
        amount: programBookings.amount,
        status: programBookings.status,
        createdAt: programBookings.createdAt,
        programName: programs.name,
      })
      .from(programBookings)
      .leftJoin(programs, eq(programBookings.programId, programs.id))
      .where(scopeCity ? sql`${programBookings.city} = ${scopeCity}` : undefined)
      .orderBy(desc(programBookings.createdAt)),
  ]);

  const rows: BookingRow[] = [
    ...asmt.map((b) => ({
      id: b.id,
      kind: "assessment" as const,
      item: "Steer Score Assessment",
      name: b.name,
      email: b.email,
      phone: b.phone,
      city: b.city,
      amount: b.amount,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
    ...progs.map((b) => ({
      id: b.id,
      kind: "program" as const,
      item: b.programName ?? "Program",
      name: b.name,
      email: b.email,
      phone: b.phone,
      city: b.city,
      amount: b.amount,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
  ].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          Operations
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Bookings</h1>
      </div>
      <BookingsTable rows={rows} />
    </div>
  );
}
