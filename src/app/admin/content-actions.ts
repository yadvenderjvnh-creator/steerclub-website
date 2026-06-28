"use server";

import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { blogPosts, faqs, testimonials, banners, activityLog } from "@/lib/db/schema";

async function log(actorId: string, action: string, entity: string, entityId: string) {
  await db.insert(activityLog).values({ actorId, action, entity, entityId });
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

// ---------- Blog ----------
export type BlogInput = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
};

export async function upsertBlogPost(input: BlogInput): Promise<{ ok: boolean; error?: string }> {
  const admin = await requirePermission("content.write");
  if (!input.title || !input.excerpt || !input.content) return { ok: false, error: "Title, excerpt and content are required." };
  const readTimeMinutes = Math.max(1, Math.round(input.content.split(/\s+/).length / 200));
  const values = {
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category || "general",
    imageUrl: input.imageUrl || null,
    metaTitle: input.metaTitle?.slice(0, 70) || null,
    metaDescription: input.metaDescription?.slice(0, 160) || null,
    readTimeMinutes,
    isPublished: input.isPublished,
    publishedAt: input.isPublished ? new Date() : null,
    authorName: "SteerClub Team",
    updatedAt: new Date(),
  };
  if (input.id) {
    await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id));
    await log(admin.id, "blog.update", "blog_post", input.id);
  } else {
    const slug = `${slugify(input.title)}-${randomBytes(2).toString("hex")}`;
    const [row] = await db.insert(blogPosts).values({ ...values, slug }).returning({ id: blogPosts.id });
    await log(admin.id, "blog.create", "blog_post", row.id);
  }
  revalidatePath("/admin/content");
  revalidatePath("/road-notes");
  return { ok: true };
}

export async function togglePublishPost(id: string, isPublished: boolean) {
  const admin = await requirePermission("content.write");
  await db.update(blogPosts).set({ isPublished, publishedAt: isPublished ? new Date() : null }).where(eq(blogPosts.id, id));
  await log(admin.id, isPublished ? "blog.publish" : "blog.unpublish", "blog_post", id);
  revalidatePath("/admin/content");
  revalidatePath("/road-notes");
}

export async function deletePost(id: string) {
  const admin = await requirePermission("content.write");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  await log(admin.id, "blog.delete", "blog_post", id);
  revalidatePath("/admin/content");
  revalidatePath("/road-notes");
}

// ---------- FAQs ----------
export type FaqInput = { id?: string; question: string; answer: string; category?: string; displayOrder?: number; isPublished: boolean };
export async function upsertFaq(input: FaqInput) {
  const admin = await requirePermission("content.write");
  const values = { question: input.question, answer: input.answer, category: input.category || null, displayOrder: input.displayOrder ?? 0, isPublished: input.isPublished };
  if (input.id) await db.update(faqs).set(values).where(eq(faqs.id, input.id));
  else await db.insert(faqs).values(values);
  await log(admin.id, input.id ? "faq.update" : "faq.create", "faq", input.id ?? "new");
  revalidatePath("/admin/content");
  revalidatePath("/membership");
}
export async function deleteFaq(id: string) {
  const admin = await requirePermission("content.write");
  await db.delete(faqs).where(eq(faqs.id, id));
  await log(admin.id, "faq.delete", "faq", id);
  revalidatePath("/admin/content");
  revalidatePath("/membership");
}

// ---------- Testimonials ----------
export type TestimonialInput = { id?: string; name: string; cityOrRole?: string; quote: string; rating?: number; imageUrl?: string | null; displayOrder?: number; isPublished: boolean };
export async function upsertTestimonial(input: TestimonialInput) {
  const admin = await requirePermission("content.write");
  const values = { name: input.name, cityOrRole: input.cityOrRole || null, quote: input.quote, rating: input.rating ?? 5, imageUrl: input.imageUrl || null, displayOrder: input.displayOrder ?? 0, isPublished: input.isPublished };
  if (input.id) await db.update(testimonials).set(values).where(eq(testimonials.id, input.id));
  else await db.insert(testimonials).values(values);
  await log(admin.id, input.id ? "testimonial.update" : "testimonial.create", "testimonial", input.id ?? "new");
  revalidatePath("/admin/content");
  revalidatePath("/");
}
export async function deleteTestimonial(id: string) {
  const admin = await requirePermission("content.write");
  await db.delete(testimonials).where(eq(testimonials.id, id));
  await log(admin.id, "testimonial.delete", "testimonial", id);
  revalidatePath("/admin/content");
  revalidatePath("/");
}

// ---------- Banners ----------
export type BannerInput = { id?: string; title: string; body?: string; ctaLabel?: string; ctaHref?: string; placement: string; isActive: boolean; displayOrder?: number };
export async function upsertBanner(input: BannerInput) {
  const admin = await requirePermission("content.write");
  const values = { title: input.title, body: input.body || null, ctaLabel: input.ctaLabel || null, ctaHref: input.ctaHref || null, placement: input.placement, isActive: input.isActive, displayOrder: input.displayOrder ?? 0 };
  if (input.id) await db.update(banners).set(values).where(eq(banners.id, input.id));
  else await db.insert(banners).values(values);
  await log(admin.id, input.id ? "banner.update" : "banner.create", "banner", input.id ?? "new");
  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/membership");
}
export async function deleteBanner(id: string) {
  const admin = await requirePermission("content.write");
  await db.delete(banners).where(eq(banners.id, id));
  await log(admin.id, "banner.delete", "banner", id);
  revalidatePath("/admin/content");
  revalidatePath("/");
}
