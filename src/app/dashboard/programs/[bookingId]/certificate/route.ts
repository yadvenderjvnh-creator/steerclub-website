import { and, eq, or } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { programBookings, programs, certificates, users } from "@/lib/db/schema";
import { CertificatePDF } from "@/components/portal/certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const user = await requireUser();
  const { bookingId } = await params;

  // Booking must belong to this user and be completed.
  const rows = await db
    .select({ id: programBookings.id, status: programBookings.status, programId: programBookings.programId, programName: programs.name })
    .from(programBookings)
    .innerJoin(programs, eq(programBookings.programId, programs.id))
    .where(
      and(
        eq(programBookings.id, bookingId),
        or(eq(programBookings.userId, user.id), eq(programBookings.email, user.email.toLowerCase()))
      )
    )
    .limit(1);
  const booking = rows[0];
  if (!booking || booking.status !== "completed") {
    return new Response("Certificate not available.", { status: 404 });
  }

  const cert = await db
    .select({ serial: certificates.serial, issuedAt: certificates.issuedAt })
    .from(certificates)
    .where(and(eq(certificates.userId, user.id), eq(certificates.programId, booking.programId)))
    .limit(1);
  if (!cert[0]) {
    return new Response("Certificate not issued yet.", { status: 404 });
  }

  const profile = await db.select({ name: users.name }).from(users).where(eq(users.id, user.id)).limit(1);

  const buffer = await renderToBuffer(
    CertificatePDF({
      name: profile[0]?.name ?? user.name,
      programName: booking.programName,
      issuedAt: new Date(cert[0].issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      serial: cert[0].serial,
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="steerclub-certificate.pdf"',
    },
  });
}
