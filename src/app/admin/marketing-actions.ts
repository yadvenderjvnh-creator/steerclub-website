"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { coupons, activityLog } from "@/lib/db/schema";

export type CouponInput = {
  code: string;
  type: "flat" | "percent";
  value: number; // rupees (flat) or percent
  minAmount?: number; // rupees
  appliesTo: "all" | "assessment" | "program" | "event" | "membership";
  validTo?: string | null; // ISO date
  usageLimit?: number | null;
};

export async function createCoupon(input: CouponInput): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireRole(["admin"]);
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Code required." };
  if (input.type === "percent" && (input.value < 1 || input.value > 100)) return { ok: false, error: "Percent must be 1–100." };

  try {
    await db.insert(coupons).values({
      code,
      type: input.type,
      value: input.type === "flat" ? Math.round(input.value * 100) : Math.round(input.value),
      minAmount: input.minAmount ? Math.round(input.minAmount * 100) : 0,
      appliesTo: input.appliesTo,
      validTo: input.validTo ? new Date(input.validTo) : null,
      usageLimit: input.usageLimit ?? null,
      isActive: true,
    });
    await db.insert(activityLog).values({ actorId: admin.id, action: "coupon.create", entity: "coupon", entityId: code });
  } catch {
    return { ok: false, error: "A coupon with that code already exists." };
  }
  revalidatePath("/admin/marketing");
  return { ok: true };
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const admin = await requireRole(["admin"]);
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
  await db.insert(activityLog).values({ actorId: admin.id, action: isActive ? "coupon.enable" : "coupon.disable", entity: "coupon", entityId: id });
  revalidatePath("/admin/marketing");
}

export async function deleteCoupon(id: string) {
  const admin = await requireRole(["admin"]);
  await db.delete(coupons).where(eq(coupons.id, id));
  await db.insert(activityLog).values({ actorId: admin.id, action: "coupon.delete", entity: "coupon", entityId: id });
  revalidatePath("/admin/marketing");
}
