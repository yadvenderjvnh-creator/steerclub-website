import { renderToBuffer } from "@react-pdf/renderer";
import { requirePermission } from "@/lib/auth/session";
import { getReportData } from "@/lib/finance/reports";
import { ReportPDF } from "@/components/admin/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requirePermission("reports.read");
  const data = await getReportData();
  const buffer = await renderToBuffer(
    ReportPDF({ data, generatedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) })
  );
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="steerclub-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
