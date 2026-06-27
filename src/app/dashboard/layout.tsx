import { requireUser } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/portal/queries";
import { PortalShell } from "@/components/portal/portal-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");
  const unreadCount = await getUnreadCount(user.id);
  return (
    <PortalShell user={user} unreadCount={unreadCount}>
      {children}
    </PortalShell>
  );
}
