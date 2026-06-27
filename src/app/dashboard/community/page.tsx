import { requireUser } from "@/lib/auth/session";
import {
  getCommunityEvents,
  getMyRegistrations,
  getAnnouncementsForUser,
  getDirectoryMembers,
  getApprovedGallery,
  isActiveMember,
  getProfile,
} from "@/lib/portal/queries";
import { CommunityClient } from "./community-client";

export const dynamic = "force-dynamic";

export default async function DashboardCommunityPage() {
  const user = await requireUser("/dashboard/community");
  const isMember = await isActiveMember(user.id);

  const [events, myRegs, anns, directory, gallery, profile] = await Promise.all([
    getCommunityEvents({ id: user.id, email: user.email }),
    getMyRegistrations({ id: user.id, email: user.email }),
    getAnnouncementsForUser({ city: user.city, isMember }),
    getDirectoryMembers(),
    getApprovedGallery(),
    getProfile(user.id),
  ]);

  return (
    <CommunityClient
      isMember={isMember}
      directoryVisible={profile?.directoryVisible ?? false}
      events={events.map((e) => ({
        slug: e.slug,
        title: e.title,
        description: e.description,
        type: e.type,
        city: e.city,
        eventDate: e.eventDate.toISOString(),
        location: e.location,
        capacity: e.capacity,
        memberOnly: e.memberOnly,
        price: e.price ?? 0,
        registered: e.registered,
        confirmedCount: e.confirmedCount,
      }))}
      myRegs={myRegs.map((r) => ({
        id: r.id,
        status: r.status,
        attended: r.attended,
        eventSlug: r.eventSlug,
        title: r.title,
        type: r.type,
        city: r.city,
        eventDate: r.eventDate.toISOString(),
        location: r.location,
      }))}
      announcements={anns.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        city: a.city,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
      }))}
      directory={directory.map((d) => ({ id: d.id, name: d.name, city: d.city, image: d.image }))}
      gallery={gallery.map((g) => ({ id: g.id, imageUrl: g.imageUrl, caption: g.caption, city: g.city }))}
    />
  );
}
