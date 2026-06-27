import { renderToBuffer } from "@react-pdf/renderer";
import { requireUser } from "@/lib/auth/session";
import { getInvoiceById } from "@/lib/billing/invoices";
import { InvoicePDF } from "@/components/billing/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const user = await requireUser();
  const { invoiceId } = await params;
  const inv = await getInvoiceById(invoiceId);
  if (!inv) return new Response("Not found", { status: 404 });

  // Ownership: invoice belongs to this user (by id or email).
  const owns = inv.userId === user.id || (inv.email && inv.email.toLowerCase() === user.email.toLowerCase());
  if (!owns) return new Response("Forbidden", { status: 403 });

  const buffer = await renderToBuffer(
    InvoicePDF({
      number: inv.number,
      issuedAt: new Date(inv.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      billToName: user.name,
      billToEmail: inv.email ?? user.email,
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
