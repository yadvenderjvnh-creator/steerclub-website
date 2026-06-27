import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getNotifications } from "@/lib/portal/queries";
import { NotificationsList, type NotifRow } from "./notifications-list";

export const metadata: Metadata = { title: "Notifications — Dashboard" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifs = await getNotifications(user.id);
  const rows: NotifRow[] = notifs.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    read: Boolean(n.readAt),
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-black text-2xl text-white uppercase">Notifications</h1>
      </div>
      <NotificationsList items={rows} />
    </div>
  );
}
