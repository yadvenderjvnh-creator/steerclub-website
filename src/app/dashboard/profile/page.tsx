import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/portal/queries";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile — Dashboard" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const initial = {
    name: profile?.name ?? user.name,
    email: profile?.email ?? user.email,
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    emergencyContactName: profile?.emergencyContactName ?? "",
    emergencyContactPhone: profile?.emergencyContactPhone ?? "",
    vehicleOwned: profile?.vehicleOwned ?? "",
    drivingGoals: profile?.drivingGoals ?? "",
    commPrefs: profile?.commPrefs ?? { email: true, whatsapp: true, sms: false },
    directoryVisible: profile?.directoryVisible ?? false,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-black text-2xl text-white uppercase">Profile</h1>
        <p className="text-steel text-sm font-ui mt-1">Keep your details up to date</p>
      </div>
      <ProfileForm initial={initial} />
    </div>
  );
}
