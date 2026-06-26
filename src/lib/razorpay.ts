import Razorpay from "razorpay";
import { createHmac } from "node:crypto";

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID ?? "",
      key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
    });
  }
  return _razorpay;
}

export async function createOrder(amountInPaise: number, receiptId: string, notes?: Record<string, string>) {
  return getRazorpay().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId,
    notes: notes ?? {},
  });
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export const PRICES = {
  assessment: 29900,
  programConfidenceFoundation: 599900,
  programCityMastery: 799900,
  programHighwayFreedom: 899900,
  programAllConditions: 899900,
  programRoadtripReady: 1099900,
  membershipMemberMonthly: 79900,
  membershipMemberAnnual: 749900,
  membershipProMonthly: 199900,
  membershipProAnnual: 1899900,
  membershipSelectAnnual: 4999900,
} as const;

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
