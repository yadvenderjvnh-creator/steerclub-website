"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CITIES, formatINR } from "@/lib/utils";
import {
  upsertEvent,
  togglePublishEvent,
  deleteEvent,
  upsertAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
  uploadGalleryPhoto,
  approveGalleryPhoto,
  deleteGalleryPhoto,
  type EventInput,
  type AnnouncementInput,
} from "../community-actions";

type City = (typeof CITIES)[number]["value"];
type EventType = "city-drive" | "workshop" | "road-trip" | "track-day" | "steerFest";
type Audience = "all" | "members" | "city" | "program";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  city: string;
  eventDate: string;
  location: string;
  locationUrl: string | null;
  capacity: number;
  memberOnly: boolean;
  price: number;
  imageUrl: string | null;
  isPublished: boolean;
  registered: number;
};
export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  audience: string;
  city: string | null;
  isPublished: boolean;
};
export type PhotoRow = {
  id: string;
  imageUrl: string;
  caption: string | null;
  city: string | null;
  approved: boolean;
};

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "city-drive", label: "City Drive" },
  { value: "workshop", label: "Workshop" },
  { value: "road-trip", label: "Road Trip" },
  { value: "track-day", label: "Track Day" },
  { value: "steerFest", label: "SteerFest" },
];

const input =
  "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";
const btn = "bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50";
const btnGhost = "border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function CommunityManager({
  events,
  announcements,
  photos,
}: {
  events: EventRow[];
  announcements: AnnouncementRow[];
  photos: PhotoRow[];
}) {
  const [tab, setTab] = useState<"events" | "announcements" | "gallery">("events");
  const tabs = [
    { id: "events" as const, label: `Events (${events.length})` },
    { id: "announcements" as const, label: `Announcements (${announcements.length})` },
    { id: "gallery" as const, label: `Gallery (${photos.length})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-heading font-black text-xs uppercase tracking-wide -mb-px border-b-2 ${
              tab === t.id ? "border-lime text-lime" : "border-transparent text-steel hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsTab events={events} />}
      {tab === "announcements" && <AnnouncementsTab announcements={announcements} />}
      {tab === "gallery" && <GalleryTab photos={photos} events={events} />}
    </div>
  );
}

// ---------- Events ----------
function emptyEvent(): EventInput {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(8, 0, 0, 0);
  return {
    title: "",
    description: "",
    type: "city-drive",
    city: "chandigarh",
    eventDate: toLocalInput(start.toISOString()),
    location: "",
    locationUrl: "",
    capacity: 12,
    memberOnly: true,
    price: 0,
    imageUrl: "",
    isPublished: false,
  };
}

function EventsTab({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<EventInput | null>(null);

  function edit(e: EventRow) {
    setForm({
      id: e.id,
      title: e.title,
      description: e.description,
      type: e.type as EventType,
      city: e.city as City,
      eventDate: toLocalInput(e.eventDate),
      location: e.location,
      locationUrl: e.locationUrl ?? "",
      capacity: e.capacity,
      memberOnly: e.memberOnly,
      price: e.price,
      imageUrl: e.imageUrl ?? "",
      isPublished: e.isPublished,
    });
  }

  function save() {
    if (!form || !form.title || !form.location) return;
    startTransition(async () => {
      await upsertEvent(form);
      setForm(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setForm(form ? null : emptyEvent())} className={btn}>
          {form ? "Close" : "New Event"}
        </button>
      </div>

      {form && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading font-black text-white uppercase text-sm tracking-wide mb-5">
            {form.id ? "Edit Event" : "New Event"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className={label}>Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={label}>Type</label>
              <select className={`${input} appearance-none`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}>
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>City</label>
              <select className={`${input} appearance-none capitalize`} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value as City })}>
                {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className={label}>Description</label>
              <textarea rows={2} className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className={label}>Date & Time</label>
              <input type="datetime-local" className={input} value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            </div>
            <div>
              <label className={label}>Capacity</label>
              <input type="number" min={1} className={input} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Price (₹, 0 = free)</label>
              <input type="number" min={0} className={input} value={form.price / 100} onChange={(e) => setForm({ ...form, price: Math.round(Number(e.target.value) * 100) })} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-white/80 text-sm font-ui">
                <input type="checkbox" checked={form.memberOnly} onChange={(e) => setForm({ ...form, memberOnly: e.target.checked })} /> Members only
              </label>
            </div>
            <div className="md:col-span-2">
              <label className={label}>Location</label>
              <input className={input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={label}>Map URL (optional)</label>
              <input className={input} value={form.locationUrl ?? ""} onChange={(e) => setForm({ ...form, locationUrl: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className={label}>Image URL (optional)</label>
              <input className={input} value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-white/80 text-sm font-ui">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published
              </label>
            </div>
          </div>
          <div className="mt-5">
            <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save Event"}</button>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {["Event", "Type", "City", "Date", "RSVPs", "Status", ""].map((h) => (
                <th key={h} className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-steel font-ui text-sm">No events yet. Create one above.</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{e.title}{e.price > 0 && <span className="ml-2 text-lime text-xs">{formatINR(e.price)}</span>}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{e.type.replace("-", " ")}</td>
                  <td className="px-4 py-3 text-white/70 capitalize">{e.city}</td>
                  <td className="px-4 py-3 text-white/70">{new Date(e.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                  <td className="px-4 py-3 text-white/70">{e.registered}/{e.capacity}</td>
                  <td className="px-4 py-3">
                    <PublishToggle published={e.isPublished} onToggle={(v) => togglePublishEvent(e.id, v)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/community/events/${e.id}`} className="text-lime font-heading font-black text-xs uppercase hover:underline">Roster →</Link>
                      <button onClick={() => edit(e)} className={btnGhost}>Edit</button>
                      <DeleteBtn onConfirm={() => deleteEvent(e.id)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Announcements ----------
function emptyAnnouncement(): AnnouncementInput {
  return { title: "", body: "", audience: "all", city: null, isPublished: false };
}

function AnnouncementsTab({ announcements }: { announcements: AnnouncementRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<AnnouncementInput | null>(null);

  function save() {
    if (!form || !form.title || !form.body) return;
    startTransition(async () => {
      await upsertAnnouncement(form);
      setForm(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setForm(form ? null : emptyAnnouncement())} className={btn}>{form ? "Close" : "New Announcement"}</button>
      </div>

      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={label}>Title</label>
              <input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className={label}>Audience</label>
              <select className={`${input} appearance-none`} value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as Audience })}>
                <option value="all">Everyone</option>
                <option value="members">Members only</option>
                <option value="city">By city</option>
              </select>
            </div>
          </div>
          {form.audience === "city" && (
            <div className="md:w-1/3">
              <label className={label}>City</label>
              <select className={`${input} appearance-none capitalize`} value={form.city ?? "chandigarh"} onChange={(e) => setForm({ ...form, city: e.target.value as City })}>
                {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={label}>Body</label>
            <textarea rows={4} className={input} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-white/80 text-sm font-ui">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Publish now
          </label>
          <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save"}</button>
        </div>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-steel font-ui text-sm">No announcements yet.</div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="glass rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-white text-sm uppercase">{a.title}</h3>
                  <span className="text-[10px] font-ui uppercase tracking-widest text-steel">
                    {a.audience === "city" ? `${a.city}` : a.audience}
                  </span>
                </div>
                <p className="text-white/70 text-sm font-ui mt-1 line-clamp-2">{a.body}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PublishToggle published={a.isPublished} onToggle={(v) => publishAnnouncement(a.id, v)} />
                <DeleteBtn onConfirm={() => deleteAnnouncement(a.id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Gallery ----------
function GalleryTab({ photos, events }: { photos: PhotoRow[]; events: EventRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [caption, setCaption] = useState("");
  const [eventId, setEventId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      startTransition(async () => {
        const res = await uploadGalleryPhoto({
          file: dataUri,
          caption: caption || null,
          eventId: eventId || null,
        });
        if (!res.ok) setErr(res.error);
        else {
          setCaption("");
          if (fileRef.current) fileRef.current.value = "";
          router.refresh();
        }
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label className={label}>Caption (optional)</label>
          <input className={input} value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div>
          <label className={label}>Event (optional)</label>
          <select className={`${input} appearance-none`} value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">None</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Photo</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPick} disabled={pending} className="text-xs text-white/70 font-ui" />
        </div>
        {pending && <p className="text-steel text-xs font-ui md:col-span-4">Uploading…</p>}
        {err && <p className="text-orange-400 text-xs font-ui md:col-span-4">{err}</p>}
      </div>

      {photos.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-steel font-ui text-sm">No photos yet. Upload above.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="glass rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.caption ?? "Gallery photo"} className="w-full h-36 object-cover" />
              <div className="p-3 space-y-2">
                {p.caption && <p className="text-white/80 text-xs font-ui line-clamp-1">{p.caption}</p>}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-ui uppercase tracking-widest ${p.approved ? "text-lime" : "text-orange-400"}`}>
                    {p.approved ? "Approved" : "Pending"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => approveGalleryPhoto(p.id, !p.approved).then(() => router.refresh())} className={btnGhost}>
                      {p.approved ? "Hide" : "Approve"}
                    </button>
                    <DeleteBtn onConfirm={() => deleteGalleryPhoto(p.id)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Shared bits ----------
function PublishToggle({ published, onToggle }: { published: boolean; onToggle: (v: boolean) => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(async () => { await onToggle(!published); router.refresh(); })}
      disabled={pending}
      className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${
        published ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"
      } disabled:opacity-50`}
    >
      {published ? "Live" : "Draft"}
    </button>
  );
}

function DeleteBtn({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button
      onClick={() => {
        if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
        startTransition(async () => { await onConfirm(); router.refresh(); });
      }}
      disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${
        armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"
      } disabled:opacity-50`}
    >
      {pending ? "…" : armed ? "Confirm" : "Delete"}
    </button>
  );
}
