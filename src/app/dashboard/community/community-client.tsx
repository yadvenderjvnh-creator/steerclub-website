"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Megaphone, Users, ImageIcon, Check } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { rsvpEvent, cancelRsvp, setDirectoryVisible } from "../community-actions";

type EventItem = {
  slug: string; title: string; description: string; type: string; city: string;
  eventDate: string; location: string; capacity: number; memberOnly: boolean;
  price: number; registered: boolean; confirmedCount: number;
};
type RegItem = {
  id: string; status: string; attended: boolean; eventSlug: string; title: string;
  type: string; city: string; eventDate: string; location: string;
};
type AnnItem = { id: string; title: string; body: string; city: string | null; publishedAt: string | null };
type DirItem = { id: string; name: string; city: string | null; image: string | null };
type PhotoItem = { id: string; imageUrl: string; caption: string | null; city: string | null };

const card = "glass rounded-xl p-5";

export function CommunityClient({
  isMember,
  directoryVisible,
  events,
  myRegs,
  announcements,
  directory,
  gallery,
}: {
  isMember: boolean;
  directoryVisible: boolean;
  events: EventItem[];
  myRegs: RegItem[];
  announcements: AnnItem[];
  directory: DirItem[];
  gallery: PhotoItem[];
}) {
  const upcomingRegs = myRegs.filter((r) => new Date(r.eventDate) >= new Date());
  const [tab, setTab] = useState<"events" | "rsvps" | "news" | "directory" | "gallery">("events");
  const tabs = [
    { id: "events" as const, label: "Events", icon: CalendarDays },
    { id: "rsvps" as const, label: `My RSVPs (${upcomingRegs.length})`, icon: Check },
    { id: "news" as const, label: "Announcements", icon: Megaphone },
    { id: "directory" as const, label: "Directory", icon: Users },
    { id: "gallery" as const, label: "Gallery", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Community</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">The Club</h1>
        <p className="text-steel text-sm font-ui mt-1">City drives, workshops, road trips — and the members who show up.</p>
      </div>

      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-heading font-black text-xs uppercase tracking-wide -mb-px border-b-2 whitespace-nowrap ${
              tab === t.id ? "border-lime text-lime" : "border-transparent text-steel hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab events={events} isMember={isMember} />}
      {tab === "rsvps" && <RsvpsTab regs={myRegs} />}
      {tab === "news" && <NewsTab announcements={announcements} />}
      {tab === "directory" && <DirectoryTab directory={directory} directoryVisible={directoryVisible} />}
      {tab === "gallery" && <GalleryTab gallery={gallery} />}
    </div>
  );
}

function EventsTab({ events, isMember }: { events: EventItem[]; isMember: boolean }) {
  if (events.length === 0) {
    return <div className={`${card} text-center text-steel font-ui text-sm py-12`}>No upcoming events right now — check back soon.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((e) => <EventCard key={e.slug} e={e} isMember={isMember} />)}
    </div>
  );
}

function EventCard({ e, isMember }: { e: EventItem; isMember: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const full = e.confirmedCount >= e.capacity;
  const isPaid = e.price > 0;

  function rsvp() {
    setErr(null);
    startTransition(async () => {
      const res = await rsvpEvent(e.slug);
      if (!res.ok) setErr(res.error ?? "Could not RSVP.");
      else router.refresh();
    });
  }
  function cancel() {
    startTransition(async () => { await cancelRsvp(e.slug); router.refresh(); });
  }

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-ui uppercase tracking-widest text-lime capitalize">{e.type.replace("-", " ")}</span>
        {e.memberOnly && <span className="text-[10px] font-ui uppercase tracking-widest text-steel">Members</span>}
      </div>
      <h3 className="font-heading font-black text-white text-lg uppercase">{e.title}</h3>
      <p className="text-white/70 text-sm font-ui mt-1 line-clamp-2">{e.description}</p>
      <div className="flex flex-col gap-1 mt-3 text-xs font-ui text-steel">
        <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{new Date(e.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{e.location} · <span className="capitalize">{e.city}</span></span>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs font-ui text-steel">{e.confirmedCount}/{e.capacity} going{isPaid ? ` · ${formatINR(e.price)}` : " · Free"}</span>
        {e.registered ? (
          <button onClick={cancel} disabled={pending} className="border border-white/15 text-white/70 font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50">
            {pending ? "…" : "Cancel RSVP"}
          </button>
        ) : full ? (
          <span className="text-orange-400 font-heading font-black text-xs uppercase">Full</span>
        ) : isPaid ? (
          <Link href={`/events/${e.slug}`} className="bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-lime/90">Register</Link>
        ) : (
          <button onClick={rsvp} disabled={pending} className="bg-lime text-asphalt font-heading font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-lime/90 disabled:opacity-50">
            {pending ? "…" : "RSVP"}
          </button>
        )}
      </div>
      {err && <p className="text-orange-400 text-xs font-ui mt-2">{err}</p>}
      {e.memberOnly && !isMember && !e.registered && (
        <p className="text-steel text-[11px] font-ui mt-2">Members-only event. <Link href="/membership" className="text-lime hover:underline">Join SteerClub</Link> to attend.</p>
      )}
    </div>
  );
}

function RsvpsTab({ regs }: { regs: RegItem[] }) {
  if (regs.length === 0) {
    return <div className={`${card} text-center text-steel font-ui text-sm py-12`}>You haven&apos;t registered for any events yet.</div>;
  }
  const now = new Date();
  return (
    <div className="space-y-3">
      {regs.map((r) => {
        const past = new Date(r.eventDate) < now;
        return (
          <div key={r.id} className={`${card} flex items-center justify-between gap-4`}>
            <div>
              <h3 className="font-heading font-black text-white text-sm uppercase">{r.title}</h3>
              <p className="text-steel text-xs font-ui mt-0.5">
                {new Date(r.eventDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {r.location}
              </p>
            </div>
            <span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${
              past ? (r.attended ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel") : "border-lime/40 text-lime bg-lime/10"
            }`}>
              {past ? (r.attended ? "Attended" : "Missed") : "Going"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NewsTab({ announcements }: { announcements: AnnItem[] }) {
  if (announcements.length === 0) {
    return <div className={`${card} text-center text-steel font-ui text-sm py-12`}>No announcements right now.</div>;
  }
  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a.id} className={card}>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-black text-white text-sm uppercase">{a.title}</h3>
            {a.city && <span className="text-[10px] font-ui uppercase tracking-widest text-steel capitalize">{a.city}</span>}
          </div>
          <p className="text-white/70 text-sm font-ui mt-1.5 whitespace-pre-line">{a.body}</p>
          {a.publishedAt && <p className="text-steel text-[11px] font-ui mt-2">{new Date(a.publishedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>}
        </div>
      ))}
    </div>
  );
}

function DirectoryTab({ directory, directoryVisible }: { directory: DirItem[]; directoryVisible: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => { await setDirectoryVisible(!directoryVisible); router.refresh(); });
  }

  return (
    <div className="space-y-5">
      <div className={`${card} flex items-center justify-between gap-4`}>
        <div>
          <h3 className="font-heading font-black text-white text-sm uppercase">Your visibility</h3>
          <p className="text-steel text-xs font-ui mt-0.5">
            {directoryVisible ? "You appear in the member directory (name + city only)." : "You're hidden from the directory."}
          </p>
        </div>
        <button onClick={toggle} disabled={pending} className={`font-heading font-black text-xs uppercase px-4 py-2 rounded-lg disabled:opacity-50 ${
          directoryVisible ? "border border-white/15 text-white/70 hover:bg-white/5" : "bg-lime text-asphalt hover:bg-lime/90"
        }`}>
          {pending ? "…" : directoryVisible ? "Hide me" : "Show me"}
        </button>
      </div>

      {directory.length === 0 ? (
        <div className={`${card} text-center text-steel font-ui text-sm py-12`}>No members are visible yet. Be the first to join the directory above.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {directory.map((d) => (
            <div key={d.id} className={`${card} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-full bg-lime/15 text-lime flex items-center justify-center font-heading font-black uppercase">
                {d.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-white font-ui text-sm truncate">{d.name}</p>
                <p className="text-steel text-xs font-ui capitalize">{d.city ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryTab({ gallery }: { gallery: PhotoItem[] }) {
  if (gallery.length === 0) {
    return <div className={`${card} text-center text-steel font-ui text-sm py-12`}>No photos yet — they&apos;ll appear here after events.</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {gallery.map((p) => (
        <div key={p.id} className="glass rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl} alt={p.caption ?? "SteerClub"} className="w-full h-40 object-cover" />
          {p.caption && <p className="text-white/70 text-xs font-ui p-3 line-clamp-2">{p.caption}</p>}
        </div>
      ))}
    </div>
  );
}
