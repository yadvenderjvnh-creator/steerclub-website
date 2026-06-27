import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/finance/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Preview a coupon discount for the checkout UI. Body: { code, source, amount }. */
export async function POST(req: NextRequest) {
  try {
    const { code, source, amount } = await req.json();
    if (typeof code !== "string" || typeof amount !== "number") {
      return NextResponse.json({ valid: false, error: "Invalid request." }, { status: 400 });
    }
    const res = await validateCoupon(code, typeof source === "string" ? source : "all", amount);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ valid: false, error: "Could not validate coupon." }, { status: 500 });
  }
}
