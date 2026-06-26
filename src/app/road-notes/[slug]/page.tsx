import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";

const ARTICLES: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  content: string;
  publishedAt: string;
  author: string;
}> = {
  "you-passed-the-test-now-what": {
    title: "You passed the test. Now what?",
    excerpt: "The honest guide to actually learning to drive after getting your license. No one tells you this part.",
    category: "technique",
    readTime: 8,
    publishedAt: "June 20, 2026",
    author: "SteerClub Team",
    content: `
The driving test in India has one job: confirm you can start a car and move it forward without immediate catastrophe.

That's it. That's the entire brief.

It says nothing about what you do when a truck materialises from a blind corner at speed. It says nothing about the Bangalore roundabout at 6:15 PM on a Friday. It says nothing about the moment the road gets wet, the light gets bad, and everything you *think* you know gets tested.

Which is why most new license holders do something that seems strange but is completely understandable: they get the license, feel briefly victorious, and then don't drive.

The car sits in the driveway. The keys get used once, returned, not touched again. Weeks become months.

If this is you, here's what I want you to understand: **you are not the exception. You are the majority.**

---

## The gap nobody talks about

India licenses approximately 10 million new drivers every year. The majority of those licenses are obtained with 5–10 lessons from a driving school instructor whose primary incentive is to get you through the RTO test, not to teach you to drive.

This creates a very specific kind of driver: one who knows how to pass a test and has never actually learned to drive.

The skills that matter — reading traffic, anticipating hazards, managing speed in conditions, handling the car in an emergency — are not tested in the RTO examination. They're also not taught.

So you pass the test. You get the license. And then you sit in the car alone for the first time and discover something uncomfortable: **you have no idea what you're doing.**

That's not failure. That's an accurate assessment of a completely broken system.

---

## What actually helps

Three things matter when you're trying to bridge the gap between licensed and capable:

**1. Structured first successes.**

The brain needs to experience something going right before it can relax. The single most effective thing a new driver can do is drive a familiar, low-traffic route consistently — the same route, the same time of day, until it stops producing anxiety. Familiarity is not a crutch. It's how confidence is built.

**2. Understanding what you're actually afraid of.**

Most driving anxiety is about loss of control in a specific scenario. For some people it's parking. For others it's merging. For others it's night driving or rain. The fear rarely generalises to "all driving" — it concentrates on one or two situations. Knowing which situations is half the work.

**3. A number to work toward.**

This is where the Steer Score™ changes things for a lot of people. Having an actual score — not a vague sense of whether you're "getting better" — creates a feedback loop that makes improvement visible and real. Scores below 50 are common. Scores above 75 are earned. The gap between them is specific, measurable, and closeable.

---

## The one thing I'd tell every new driver

Take the assessment before you take another lesson.

Not because the lesson is a bad idea. Because without knowing your specific gaps, you're taking lessons for problems you may not have while the problems you do have go unaddressed.

The Steer Score is 30 minutes. It tells you exactly where you are. The number does the work.

Your license was the beginning. This is what comes next.

— *SteerClub Team*
    `,
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: "SteerClub" },
    publisher: { "@type": "Organization", name: "SteerClub", url: "https://steerclub.in" },
    datePublished: article.publishedAt,
  };

  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <div className="container max-w-[1440px]">
        <div className="max-w-[720px] mx-auto py-16">
          {/* Back */}
          <Link
            href="/road-notes"
            className="flex items-center gap-2 text-xs text-steel font-ui uppercase tracking-widest mb-8 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Road Notes
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
              {article.category.replace("-", " ")}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-steel font-ui">
              <Clock className="w-3.5 h-3.5" /> {article.readTime} min read
            </span>
            <span className="text-xs text-steel font-ui">{article.publishedAt}</span>
          </div>

          {/* Title */}
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white uppercase mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-white/60 font-body italic mb-12 border-b border-white/10 pb-12">
            {article.excerpt}
          </p>

          {/* Content */}
          <div className="prose-sc space-y-6">
            {article.content.split("\n\n").map((para, i) => {
              if (para.startsWith("## ")) {
                return (
                  <h2 key={i} className="font-heading font-black text-xl text-white uppercase mt-10 mb-4">
                    {para.slice(3)}
                  </h2>
                );
              }
              if (para.startsWith("**")) {
                const lines = para.split("\n").filter(Boolean);
                return (
                  <div key={i} className="space-y-4">
                    {lines.map((line, j) => {
                      const match = line.match(/^\*\*(.+?)\*\*(.*)$/);
                      if (match) {
                        return (
                          <p key={j} className="text-white/80 font-body leading-relaxed">
                            <strong className="text-white font-heading font-black">{match[1]}</strong>
                            {match[2]}
                          </p>
                        );
                      }
                      return <p key={j} className="text-white/70 font-body leading-relaxed">{line}</p>;
                    })}
                  </div>
                );
              }
              if (para === "---") {
                return <hr key={i} className="border-white/10 my-8" />;
              }
              return (
                <p key={i} className="text-white/70 font-body leading-relaxed text-lg"
                   dangerouslySetInnerHTML={{
                     __html: para
                       .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                       .replace(/\*(.+?)\*/g, '<em>$1</em>'),
                   }}
                />
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 glass rounded-2xl p-8 text-center">
            <p className="font-heading font-black text-xl text-white uppercase mb-2">
              Find out where you actually stand.
            </p>
            <p className="text-white/50 font-body mb-6">
              The Steer Score tells you exactly which gaps to close — in 30 minutes.
            </p>
            <Link
              href="/score/book"
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
            >
              Book Your Assessment — ₹299
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
