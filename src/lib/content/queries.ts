import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts, faqs, testimonials, banners } from "@/lib/db/schema";

/** Published blog posts, newest first. Public — no auth. */
export async function getPublishedPosts(limit = 50) {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function getPostBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
    .limit(1);
  return row ?? null;
}

export async function getPublishedFaqs() {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.isPublished, true))
    .orderBy(faqs.displayOrder);
}

export async function getPublishedTestimonials() {
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isPublished, true))
    .orderBy(testimonials.displayOrder);
}

/** Active banners for a placement (or global), within their date window. */
export async function getActiveBanners(placement: string) {
  const now = new Date();
  return db
    .select()
    .from(banners)
    .where(
      and(
        eq(banners.isActive, true),
        or(eq(banners.placement, placement), eq(banners.placement, "global")),
        sql`(${banners.startsAt} is null or ${banners.startsAt} <= ${now})`,
        sql`(${banners.endsAt} is null or ${banners.endsAt} >= ${now})`
      )
    )
    .orderBy(banners.displayOrder);
}
