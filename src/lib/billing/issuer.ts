/**
 * Invoice issuer details + GST config. Receipts work immediately with no GST;
 * set COMPANY_GSTIN (+ optional COMPANY_GST_RATE / COMPANY_HSN) in Vercel to flip
 * on full GST tax invoices with zero code changes.
 */
export const ISSUER = {
  legalName: "Steer Co.",
  brand: "SteerClub",
  address: "Zirakpur, Punjab, India",
  email: process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1] ?? "hello@steerclub.in",
  site: "steerclub.in",
};

export type GstBreakup = {
  rate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstin: string;
  hsn: string;
};

export function gstConfigured(): boolean {
  return Boolean(process.env.COMPANY_GSTIN);
}

/**
 * Compute a GST breakup from a GST-inclusive total (paise). Returns null when no
 * GSTIN is configured (→ plain receipt). Intra-state split (CGST+SGST) by default.
 */
export function computeGstBreakup(total: number): GstBreakup | null {
  const gstin = process.env.COMPANY_GSTIN;
  if (!gstin) return null;
  const rate = Number(process.env.COMPANY_GST_RATE ?? 18);
  const hsn = process.env.COMPANY_HSN ?? "999293"; // SAC: training/coaching services
  const taxable = Math.round(total / (1 + rate / 100));
  const gst = total - taxable;
  const cgst = Math.round(gst / 2);
  const sgst = gst - cgst;
  return { rate, taxable, cgst, sgst, igst: 0, gstin, hsn };
}
