import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Users, Clock, MapPin } from "lucide-react";
import { PROGRAMS, formatINR, getProgramBySlug } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};
  return {
    title: `${program.name} — ${program.tagline}`,
    description: `${program.forProfile} ${program.sessions} sessions, ${program.durationHours} hours. ${formatINR(program.price)}.`,
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.forProfile,
    provider: {
      "@type": "Organization",
      name: "SteerClub",
      url: "https://steerclub.in",
    },
    offers: {
      "@type": "Offer",
      price: program.price / 100,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="pt-24 bg-asphalt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Hero */}
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
                  Score {program.scoreRange[0]}–{program.scoreRange[1]}
                </span>
                <span className="text-xs font-ui text-steel bg-white/5 px-3 py-1 rounded">
                  {program.sessions} sessions · {program.durationHours}h total
                </span>
              </div>
              <h1 className="font-heading font-black text-section text-white uppercase mb-4">
                {program.name}
              </h1>
              <p className="text-xl text-lime font-body italic mb-6">
                &ldquo;{program.tagline}&rdquo;
              </p>
              <p className="text-white/60 font-body text-lg leading-relaxed mb-8">
                {program.forProfile}
              </p>

              {/* Outcomes */}
              <div className="space-y-4 mb-8">
                <p className="text-xs font-ui uppercase tracking-widest text-steel">
                  After this program, you'll be able to:
                </p>
                {program.outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                    <p className="text-white/80 font-body">{outcome}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/programs/${program.slug}/book`}
                  className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all hover:scale-[1.02]"
                >
                  Book This Program — {formatINR(program.price)}
                </Link>
                <a
                  href={buildWhatsAppLink(WA_MESSAGES.bookProgram(program.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:border-white/50 transition-all"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            {/* Right: Program summary card */}
            <div className="glass rounded-2xl p-7 space-y-5">
              <h3 className="font-heading font-black text-white uppercase text-sm tracking-wide">
                Program Details
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Clock, label: "Duration", value: `${program.sessions} sessions · ${program.durationHours} hours total` },
                  { icon: Users, label: "Cohort size", value: "8–10 drivers per cohort" },
                  { icon: MapPin, label: "Cities", value: program.cities.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <Icon className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-ui uppercase tracking-widest text-steel">{label}</p>
                      <p className="text-white/80 font-body text-sm mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-heading font-black">Program Fee</span>
                  <span className="font-heading font-black text-2xl text-white">{formatINR(program.price)}</span>
                </div>
                <p className="text-xs text-steel font-ui">Members pay {formatINR(program.memberPrice)} (15% off)</p>
                <p className="text-xs text-steel font-ui mt-1">= {formatINR(Math.round(program.price / program.sessions))} per session</p>
              </div>

              <Link
                href={`/programs/${program.slug}/book`}
                className="block w-full text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
              >
                Book This Program
              </Link>
              <Link
                href="/score/book"
                className="block w-full text-center text-xs font-ui text-steel hover:text-white transition-colors"
              >
                Not sure? Take your Steer Score first →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Score range context */}
      <section className="py-16 bg-lgrey">
        <div className="container max-w-[1440px]">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-ui uppercase tracking-widest text-steel mb-3">Who this is for</p>
            <p className="font-heading font-black text-2xl text-white uppercase mb-4">
              Typically taken by drivers scoring {program.scoreRange[0]}–{program.scoreRange[1]} on the Steer Score
            </p>
            <p className="text-white/60 font-body mb-6">
              Members who complete this program improve their score by an average of 15–22 points.
            </p>
            <Link href="/score/book" className="text-sm font-heading font-black text-lime uppercase tracking-wide hover:underline">
              Take your assessment first — ₹299 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
