import { db } from "@/lib/db";
import { orgSettings } from "@/lib/db/schema";
import type { GstBreakup } from "./issuer";

/** Resolve billing config DB-first (orgSettings), env as fallback. */
export async function getBillingConfig() {
  const [s] = await db.select().from(orgSettings).limit(1);
  const gstin = s?.gstin || process.env.COMPANY_GSTIN || null;
  const rate = s?.gstRate ?? Number(process.env.COMPANY_GST_RATE ?? 18);
  const hsn = s?.hsn || process.env.COMPANY_HSN || "999293";
  const legalName = s?.legalName || "Steer Co.";
  return { gstin, rate, hsn, legalName };
}

/** GST breakup from a GST-inclusive total (paise), DB-first. null when no GSTIN. */
export async function getGstBreakup(total: number): Promise<GstBreakup | null> {
  const { gstin, rate, hsn } = await getBillingConfig();
  if (!gstin) return null;
  const taxable = Math.round(total / (1 + rate / 100));
  const gst = total - taxable;
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;
  return { rate, taxable, cgst, sgst, igst: 0, gstin, hsn };
}
