import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons, couponRedemptions } from "@/lib/db/schema";

export type CouponResult = {
  valid: boolean;
  error?: string;
  discount: number;
  finalAmount: number;
  couponId?: string;
  code?: string;
};

/** Validate a coupon for a given source + amount (paise). Pure read — no side effects. */
export async function validateCoupon(code: string, source: string, amount: number): Promise<CouponResult> {
  const c = code.trim().toUpperCase();
  const fail = (error: string): CouponResult => ({ valid: false, error, discount: 0, finalAmount: amount });
  if (!c) return fail("Enter a coupon code.");

  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, c)).limit(1);
  if (!coupon || !coupon.isActive) return fail("Invalid coupon code.");

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) return fail("This coupon isn't active yet.");
  if (coupon.validTo && coupon.validTo < now) return fail("This coupon has expired.");
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return fail("This coupon has reached its usage limit.");
  if (coupon.appliesTo !== "all" && coupon.appliesTo !== source) return fail("This coupon isn't valid for this item.");
  if (coupon.minAmount && amount < coupon.minAmount) return fail(`Minimum order of ₹${(coupon.minAmount / 100).toLocaleString("en-IN")} required.`);

  let discount = coupon.type === "percent" ? Math.round((amount * coupon.value) / 100) : coupon.value;
  discount = Math.min(Math.max(discount, 0), amount);
  return { valid: true, discount, finalAmount: amount - discount, couponId: coupon.id, code: c };
}

/** Record a coupon redemption + bump usedCount. Idempotent per (source, bookingId). */
export async function recordCouponRedemption(input: {
  code: string;
  source: string;
  bookingId: string;
  email?: string | null;
  userId?: string | null;
  amountDiscounted: number;
}): Promise<void> {
  try {
    const c = input.code.trim().toUpperCase();
    const [coupon] = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, c)).limit(1);
    if (!coupon) return;

    const [dupe] = await db
      .select({ id: couponRedemptions.id })
      .from(couponRedemptions)
      .where(and(eq(couponRedemptions.source, input.source), eq(couponRedemptions.bookingId, input.bookingId)))
      .limit(1);
    if (dupe) return;

    await db.insert(couponRedemptions).values({
      couponId: coupon.id,
      userId: input.userId ?? null,
      email: input.email ?? null,
      source: input.source,
      bookingId: input.bookingId,
      amountDiscounted: input.amountDiscounted,
    });
    await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, coupon.id));
  } catch (err) {
    console.error("recordCouponRedemption failed:", err);
  }
}

/** Convenience for create-order: validate + return the discounted amount (or original on failure). */
export async function maybeApplyCoupon(code: string | undefined | null, source: string, amount: number) {
  if (!code) return { amount, discount: 0, code: null as string | null };
  const res = await validateCoupon(code, source, amount);
  if (!res.valid) return { amount, discount: 0, code: null as string | null };
  return { amount: res.finalAmount, discount: res.discount, code: res.code ?? null };
}
