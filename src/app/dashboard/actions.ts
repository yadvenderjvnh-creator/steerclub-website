"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, notifications } from "@/lib/db/schema";

const CITY_VALUES = [
  "chandigarh", "delhi", "bangalore", "mumbai", "hyderabad", "pune", "chennai",
] as const;
type CityValue = (typeof CITY_VALUES)[number];
function normCity(c?: string | null): CityValue | null {
  return c && (CITY_VALUES as readonly string[]).includes(c) ? (c as CityValue) : null;
}

export async function updateProfile(data: {
  name?: string;
  phone?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  vehicleOwned?: string | null;
  drivingGoals?: string | null;
  commPrefs?: { email: boolean; whatsapp: boolean; sms: boolean };
  directoryVisible?: boolean;
}) {
  const user = await requireUser();
  await db
    .update(users)
    .set({
      ...(data.name ? { name: data.name } : {}),
      phone: data.phone ?? null,
      city: normCity(data.city),
      emergencyContactName: data.emergencyContactName ?? null,
      emergencyContactPhone: data.emergencyContactPhone ?? null,
      vehicleOwned: data.vehicleOwned ?? null,
      drivingGoals: data.drivingGoals ?? null,
      ...(data.commPrefs ? { commPrefs: data.commPrefs } : {}),
      ...(data.directoryVisible !== undefined ? { directoryVisible: data.directoryVisible } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}

export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}
