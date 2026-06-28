import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts, faqs, testimonials, banners } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth/session";
import { ContentManager, type PostRow, type FaqRow, type TestimonialRow, type BannerRow } from "./content-manager";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireRole(["admin"]);
  const [posts, faqRows, testRows, bannerRows] = await Promise.all([
    db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)).limit(100),
    db.select().from(faqs).orderBy(faqs.displayOrder),
    db.select().from(testimonials).orderBy(testimonials.displayOrder),
    db.select().from(banners).orderBy(banners.displayOrder),
  ]);

  const postData: PostRow[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    imageUrl: p.imageUrl,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    isPublished: p.isPublished,
  }));
  const faqData: FaqRow[] = faqRows.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category, displayOrder: f.displayOrder, isPublished: f.isPublished }));
  const testData: TestimonialRow[] = testRows.map((t) => ({ id: t.id, name: t.name, cityOrRole: t.cityOrRole, quote: t.quote, rating: t.rating ?? 5, displayOrder: t.displayOrder, isPublished: t.isPublished }));
  const bannerData: BannerRow[] = bannerRows.map((b) => ({ id: b.id, title: b.title, body: b.body, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, placement: b.placement, isActive: b.isActive, displayOrder: b.displayOrder }));

  return (
    <div>
      <div className="mb-8">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-2">Content</p>
        <h1 className="font-heading font-black text-3xl text-white uppercase">Content & SEO</h1>
        <p className="text-steel text-sm font-ui mt-1">Blog (Road Notes), FAQs, testimonials and site banners.</p>
      </div>
      <ContentManager posts={postData} faqs={faqData} testimonials={testData} banners={bannerData} />
    </div>
  );
}
