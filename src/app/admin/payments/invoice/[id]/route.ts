import { eq } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getInvoiceById } from "@/lib/billing/invoices";
import { InvoicePDF } from "@/components/billing/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requirePermission("payments.read");
  const { id } = await params;
  const inv = await getInvoiceById(id);
  if (!inv) return new Response("Not found", { status: 404 });

  let name = inv.email ?? "Customer";
  if (inv.userId) {
    const [u] = await db.select({ name: users.name }).from(users).where(eq(users.id, inv.userId)).limit(1);
    if (u) name = u.name;
  }

  const buffer = await renderToBuffer(
    InvoicePDF({
      number: inv.number,
      issuedAt: new Date(inv.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      billToName: name,
      billToEmail: inv.email ?? "",
      lineItem: inv.lineItem,
      subtotal: inv.subtotal,
      total: inv.total,
      gst: inv.gstBreakup ?? null,
      status: inv.status,
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.number.replace(/\//g, "-")}.pdf"`,
    },
  });
}
