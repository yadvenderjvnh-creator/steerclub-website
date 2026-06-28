import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { getPublishedPosts } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Road Notes — India's Driving Knowledge Base",
  description:
    "SteerClub's Road Notes: practical, opinionated driving guides for Indian roads. City guides, technique breakdowns, route planning, member stories, and more.",
};

export const dynamic = "force-dynamic";

const FEATURED_ARTICLES = [
  {
    slug: "you-passed-the-test-now-what",
    title: "You passed the test. Now what?",
    excerpt: "The honest guide to actually learning to drive after getting your license. No one tells you this part.",
    category: "technique",
    readTime: 8,
    tag: "Most Read",
  },
  {
    slug: "why-your-mirrors-are-probably-wrong",
    title: "Why your mirrors are probably set wrong — and how to fix it in 60 seconds",
    excerpt: "Most drivers have their mirrors positioned to avoid blind spots incorrectly. Here's the method that works.",
    category: "technique",
    readTime: 4,
    tag: null,
  },
  {
    slug: "driving-in-bangalore-rain",
    title: "Driving in Bangalore rain: an honest guide",
    excerpt: "The city floods in 20 minutes. Traffic turns aggressive. Here's what you actually need to know.",
    category: "city-guides",
    readTime: 6,
    tag: null,
  },
  {
    slug: "atal-tunnel-driving-guide",
    title: "How to drive the Atal Tunnel: what nobody tells you",
    excerpt: "India's longest road tunnel. 9km of darkness. The preparation most drivers skip.",
    category: "routes",
    readTime: 7,
    tag: null,
  },
  {
    slug: "woman-breaking-down-highway",
    title: "A woman's guide to breaking down alone on a highway",
    excerpt: "Practical. Specific. No fear-mongering. What to do, in order, when it happens.",
    category: "technique",
    readTime: 10,
    tag: "SteerClub Recommended",
  },
  {
    slug: "overconfident-drivers-score",
    title: "What happens when overconfident drivers take the Steer Score",
    excerpt: "They think they're above average. The score disagrees. What it reveals — and what they do next.",
    category: "member-stories",
    readTime: 5,
    tag: null,
  },
];

const CATEGORIES = [
  { value: "city-guides", label: "City Guides" },
  { value: "technique", label: "Technique" },
  { value: "routes", label: "Route Guides" },
  { value: "member-stories", label: "Member Stories" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "technique": "text-lime bg-lime/10",
  "city-guides": "text-blue-400 bg-blue-400/10",
  "routes": "text-orange-400 bg-orange-400/10",
  "member-stories": "text-purple-400 bg-purple-400/10",
};

export default async function RoadNotesPage() {
  const dbPosts = await getPublishedPosts();
  const articles =
    dbPosts.length > 0
      ? dbPosts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, readTime: p.readTimeMinutes ?? 5, tag: null as string | null }))
      : FEATURED_ARTICLES;

  return (
    <div className="pt-24 bg-asphalt">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Road Notes
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              India's definitive
              <br />
              <span className="text-lime">driving knowledge.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              Not rules and regulations. Real-world, practical, opinionated guides
              for Indian roads, Indian conditions, and Indian drivers.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/road-notes"
              className="text-xs font-heading font-black uppercase tracking-wide px-4 py-2 bg-lime text-asphalt"
            >
              All
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/road-notes/category/${cat.value}`}
                className="text-xs font-heading font-black uppercase tracking-wide px-4 py-2 border border-white/20 text-white/60 hover:border-white/50 hover:text-white transition-all"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Featured article */}
          <div className="mb-8">
            <Link
              href={`/road-notes/${articles[0].slug}`}
              className="group block glass rounded-2xl p-8 md:p-12 hover:border-lime/20 border border-transparent transition-all duration-300"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-xs font-ui uppercase tracking-widest px-3 py-1 rounded ${CATEGORY_COLORS[articles[0].category]}`}>
                  {CATEGORIES.find(c => c.value === articles[0].category)?.label}
                </span>
                {articles[0].tag && (
                  <span className="text-xs font-ui uppercase tracking-widest text-white/50 bg-white/5 px-3 py-1 rounded">
                    {articles[0].tag}
                  </span>
                )}
              </div>
              <h2 className="font-heading font-black text-3xl md:text-4xl text-white uppercase mb-4 group-hover:text-lime transition-colors max-w-2xl">
                {articles[0].title}
              </h2>
              <p className="text-white/60 font-body text-lg leading-relaxed mb-6 max-w-xl">
                {articles[0].excerpt}
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                  <Clock className="w-3.5 h-3.5" />
                  {articles[0].readTime} min read
                </span>
                <span className="text-lime font-heading font-black text-sm group-hover:gap-2 flex items-center gap-1 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(1).map((article) => (
              <Link
                key={article.slug}
                href={`/road-notes/${article.slug}`}
                className="group block glass rounded-xl p-6 hover:border-lime/20 border border-transparent transition-all duration-300"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-xs font-ui uppercase tracking-widest px-2 py-1 rounded ${CATEGORY_COLORS[article.category]}`}>
                    {CATEGORIES.find(c => c.value === article.category)?.label}
                  </span>
                  {article.tag && (
                    <span className="text-xs font-ui text-white/40 bg-white/5 px-2 py-1 rounded">
                      {article.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-black text-base text-white uppercase mb-3 group-hover:text-lime transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-white/50 font-body leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
                  <Clock className="w-3 h-3" />
                  {article.readTime} min read
                </span>
              </Link>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-lgrey rounded-2xl p-8 md:p-12 text-center">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-3">
              Road Notes Newsletter
            </p>
            <h2 className="font-heading font-black text-2xl text-white uppercase mb-3">
              India's best driving reads.
              <br />Monthly. Free.
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-md mx-auto">
              New articles, member stories, event announcements, and the occasional Steer Score stat that'll
              make you rethink how well you drive.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-graphite border border-white/10 text-white font-ui px-4 py-3 rounded-lg focus:outline-none focus:border-lime/50 transition-colors placeholder:text-steel"
              />
              <button
                type="submit"
                className="bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:bg-lime/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
