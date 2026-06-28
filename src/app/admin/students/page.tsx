import { and, eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, assessmentBookings } from "@/lib/db/schema";
import { StudentsTable, type StudentRow } from "./students-table";
import { requirePermission } from "@/lib/auth/session";
import { branchScopeCity } from "@/lib/auth/branch";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const admin = await requirePermission("students.read");
  const scopeCity = await branchScopeCity(admin);
  const [clientUsers, bookings] = await Promise.all([
    db
      .select()
      .from(users)
      .where(scopeCity ? and(eq(users.role, "client"), sql`${users.city} = ${scopeCity}`) : eq(users.role, "client"))
      .orderBy(desc(users.createdAt)),
    db
      .select({ email: assessmentBookings.email, status: assessmentBookings.status })
      .from(assessmentBookings),
  ]);

  const countByEmail = new Map<string, number>();
  for (const b of bookings) {
    countByEmail.set(b.email.toLowerCase(), (countByEmail.get(b.email.toLowerCase()) ?? 0) + 1);
  }

  const rows: StudentRow[] = clientUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    bookings: countByEmail.get(u.email.toLowerCase()) ?? 0,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">
          People
        </p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Students</h1>
      </div>
      <StudentsTable rows={rows} />
    </div>
  );
}
