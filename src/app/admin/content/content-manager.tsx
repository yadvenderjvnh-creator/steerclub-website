"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  upsertBlogPost, togglePublishPost, deletePost,
  upsertFaq, deleteFaq,
  upsertTestimonial, deleteTestimonial,
  upsertBanner, deleteBanner,
  type BlogInput, type FaqInput, type TestimonialInput, type BannerInput,
} from "../content-actions";

export type PostRow = { id: string; slug: string; title: string; excerpt: string; content: string; category: string; imageUrl: string | null; metaTitle: string | null; metaDescription: string | null; isPublished: boolean };
export type FaqRow = { id: string; question: string; answer: string; category: string | null; displayOrder: number; isPublished: boolean };
export type TestimonialRow = { id: string; name: string; cityOrRole: string | null; quote: string; rating: number; displayOrder: number; isPublished: boolean };
export type BannerRow = { id: string; title: string; body: string | null; ctaLabel: string | null; ctaHref: string | null; placement: string; isActive: boolean; displayOrder: number };

const input = "w-full bg-graphite border border-white/10 text-white text-sm font-ui px-3 py-2 rounded-lg focus:outline-none focus:border-lime/50";
const label = "block text-xs font-ui uppercase tracking-widest text-steel mb-1.5";
const btn = "bg-lime text-asphalt font-heading font-black text-sm uppercase px-5 py-2.5 rounded-lg hover:bg-lime/90 disabled:opacity-50";
const ghost = "border border-white/15 text-white/80 font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-white/5";

export function ContentManager({ posts, faqs, testimonials, banners }: { posts: PostRow[]; faqs: FaqRow[]; testimonials: TestimonialRow[]; banners: BannerRow[] }) {
  const [tab, setTab] = useState<"blog" | "faqs" | "testimonials" | "banners">("blog");
  const tabs = [
    { id: "blog" as const, label: `Blog (${posts.length})` },
    { id: "faqs" as const, label: `FAQs (${faqs.length})` },
    { id: "testimonials" as const, label: `Testimonials (${testimonials.length})` },
    { id: "banners" as const, label: `Banners (${banners.length})` },
  ];
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 font-heading font-black text-xs uppercase tracking-wide -mb-px border-b-2 whitespace-nowrap ${tab === t.id ? "border-lime text-lime" : "border-transparent text-steel hover:text-white"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "blog" && <BlogTab posts={posts} />}
      {tab === "faqs" && <FaqTab faqs={faqs} />}
      {tab === "testimonials" && <TestimonialTab testimonials={testimonials} />}
      {tab === "banners" && <BannerTab banners={banners} />}
    </div>
  );
}

function DeleteBtn({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [armed, setArmed] = useState(false);
  return (
    <button onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; } startTransition(async () => { await onConfirm(); router.refresh(); }); }} disabled={pending}
      className={`font-heading font-black text-xs uppercase px-3 py-1.5 rounded-lg ${armed ? "bg-orange-500/20 text-orange-400" : "border border-white/15 text-steel hover:text-white"} disabled:opacity-50`}>
      {pending ? "…" : armed ? "Confirm" : "Delete"}
    </button>
  );
}

function PublishPill({ on }: { on: boolean }) {
  return <span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${on ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"}`}>{on ? "Live" : "Draft"}</span>;
}

// ---------- Blog ----------
function emptyPost(): BlogInput { return { title: "", excerpt: "", content: "", category: "technique", imageUrl: "", metaTitle: "", metaDescription: "", isPublished: false }; }

function BlogTab({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<BlogInput | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function edit(p: PostRow) {
    setForm({ id: p.id, title: p.title, excerpt: p.excerpt, content: p.content, category: p.category, imageUrl: p.imageUrl ?? "", metaTitle: p.metaTitle ?? "", metaDescription: p.metaDescription ?? "", isPublished: p.isPublished });
  }
  function save() {
    if (!form) return;
    setErr(null);
    startTransition(async () => { const r = await upsertBlogPost(form); if (!r.ok) setErr(r.error ?? "Failed."); else { setForm(null); router.refresh(); } });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button onClick={() => setForm(form ? null : emptyPost())} className={btn}>{form ? "Close" : "New Post"}</button></div>
      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className={label}>Title</label><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className={label}>Category</label><input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          </div>
          <div><label className={label}>Excerpt</label><textarea rows={2} className={input} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
          <div><label className={label}>Content (markdown)</label><textarea rows={10} className={input} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={label}>Cover image URL</label><input className={input} value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></div>
            <div><label className={label}>SEO title (≤70)</label><input className={input} value={form.metaTitle ?? ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} /></div>
          </div>
          <div><label className={label}>SEO description (≤160)</label><input className={input} value={form.metaDescription ?? ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-white/80 text-sm font-ui"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
          <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save Post"}</button>
          {err && <p className="text-orange-400 text-xs font-ui">{err}</p>}
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {posts.length === 0 ? <p className="p-12 text-center text-steel font-ui text-sm">No posts yet.</p> : posts.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-white font-ui truncate">{p.title}</p><p className="text-steel text-xs font-ui">{p.category} · /{p.slug}</p></div>
            <div className="flex items-center gap-2 shrink-0">
              <PublishToggle on={p.isPublished} onToggle={(v) => togglePublishPost(p.id, v)} />
              <button onClick={() => edit(p)} className={ghost}>Edit</button>
              <DeleteBtn onConfirm={() => deletePost(p.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishToggle({ on, onToggle }: { on: boolean; onToggle: (v: boolean) => Promise<void> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(async () => { await onToggle(!on); router.refresh(); })} disabled={pending} className="disabled:opacity-50"><PublishPill on={on} /></button>
  );
}

// ---------- FAQs ----------
function emptyFaq(): FaqInput { return { question: "", answer: "", category: "", displayOrder: 0, isPublished: true }; }
function FaqTab({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FaqInput | null>(null);
  function save() { if (!form) return; startTransition(async () => { await upsertFaq(form); setForm(null); router.refresh(); }); }
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button onClick={() => setForm(form ? null : emptyFaq())} className={btn}>{form ? "Close" : "New FAQ"}</button></div>
      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div><label className={label}>Question</label><input className={input} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <div><label className={label}>Answer</label><textarea rows={3} className={input} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Category</label><input className={input} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><label className={label}>Order</label><input type="number" className={input} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} /></div>
          </div>
          <label className="flex items-center gap-2 text-white/80 text-sm font-ui"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
          <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save"}</button>
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {faqs.length === 0 ? <p className="p-12 text-center text-steel font-ui text-sm">No FAQs yet.</p> : faqs.map((f) => (
          <div key={f.id} className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0"><p className="text-white font-ui">{f.question}</p><p className="text-steel text-xs font-ui mt-0.5 line-clamp-1">{f.answer}</p></div>
            <div className="flex items-center gap-2 shrink-0"><PublishPill on={f.isPublished} /><button onClick={() => setForm({ id: f.id, question: f.question, answer: f.answer, category: f.category ?? "", displayOrder: f.displayOrder, isPublished: f.isPublished })} className={ghost}>Edit</button><DeleteBtn onConfirm={() => deleteFaq(f.id)} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Testimonials ----------
function emptyTest(): TestimonialInput { return { name: "", cityOrRole: "", quote: "", rating: 5, displayOrder: 0, isPublished: true }; }
function TestimonialTab({ testimonials }: { testimonials: TestimonialRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<TestimonialInput | null>(null);
  function save() { if (!form) return; startTransition(async () => { await upsertTestimonial(form); setForm(null); router.refresh(); }); }
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button onClick={() => setForm(form ? null : emptyTest())} className={btn}>{form ? "Close" : "New Testimonial"}</button></div>
      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Name</label><input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className={label}>City / role</label><input className={input} value={form.cityOrRole ?? ""} onChange={(e) => setForm({ ...form, cityOrRole: e.target.value })} /></div>
          </div>
          <div><label className={label}>Quote</label><textarea rows={3} className={input} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Rating (1–5)</label><input type="number" min={1} max={5} className={input} value={form.rating ?? 5} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            <div><label className={label}>Order</label><input type="number" className={input} value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} /></div>
          </div>
          <label className="flex items-center gap-2 text-white/80 text-sm font-ui"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} /> Published</label>
          <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save"}</button>
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {testimonials.length === 0 ? <p className="p-12 text-center text-steel font-ui text-sm">No testimonials yet.</p> : testimonials.map((t) => (
          <div key={t.id} className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0"><p className="text-white font-ui">{t.name} <span className="text-steel text-xs">· {t.cityOrRole}</span></p><p className="text-steel text-xs font-ui mt-0.5 line-clamp-1">&ldquo;{t.quote}&rdquo;</p></div>
            <div className="flex items-center gap-2 shrink-0"><PublishPill on={t.isPublished} /><button onClick={() => setForm({ id: t.id, name: t.name, cityOrRole: t.cityOrRole ?? "", quote: t.quote, rating: t.rating, displayOrder: t.displayOrder, isPublished: t.isPublished })} className={ghost}>Edit</button><DeleteBtn onConfirm={() => deleteTestimonial(t.id)} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Banners ----------
function emptyBanner(): BannerInput { return { title: "", body: "", ctaLabel: "", ctaHref: "", placement: "global", isActive: false, displayOrder: 0 }; }
function BannerTab({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<BannerInput | null>(null);
  function save() { if (!form) return; startTransition(async () => { await upsertBanner(form); setForm(null); router.refresh(); }); }
  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button onClick={() => setForm(form ? null : emptyBanner())} className={btn}>{form ? "Close" : "New Banner"}</button></div>
      {form && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className={label}>Title</label><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className={label}>Placement</label><select className={`${input} appearance-none`} value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}><option value="global">Global</option><option value="home">Home</option><option value="membership">Membership</option></select></div>
          </div>
          <div><label className={label}>Body</label><input className={input} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>CTA label</label><input className={input} value={form.ctaLabel ?? ""} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} /></div>
            <div><label className={label}>CTA link</label><input className={input} value={form.ctaHref ?? ""} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-white/80 text-sm font-ui"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          <button onClick={save} disabled={pending} className={btn}>{pending ? "Saving…" : "Save"}</button>
        </div>
      )}
      <div className="glass rounded-xl divide-y divide-white/5">
        {banners.length === 0 ? <p className="p-12 text-center text-steel font-ui text-sm">No banners yet.</p> : banners.map((b) => (
          <div key={b.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-white font-ui truncate">{b.title}</p><p className="text-steel text-xs font-ui">{b.placement}{b.ctaLabel ? ` · ${b.ctaLabel}` : ""}</p></div>
            <div className="flex items-center gap-2 shrink-0"><span className={`text-[10px] font-ui uppercase tracking-widest px-2.5 py-1 rounded-full border ${b.isActive ? "border-lime/40 text-lime bg-lime/10" : "border-white/15 text-steel"}`}>{b.isActive ? "Active" : "Off"}</span><button onClick={() => setForm({ id: b.id, title: b.title, body: b.body ?? "", ctaLabel: b.ctaLabel ?? "", ctaHref: b.ctaHref ?? "", placement: b.placement, isActive: b.isActive, displayOrder: b.displayOrder })} className={ghost}>Edit</button><DeleteBtn onConfirm={() => deleteBanner(b.id)} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
