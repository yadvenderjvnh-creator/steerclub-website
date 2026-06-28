import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ScoreIntro } from "@/components/home/score-intro";
import { ProgramsGrid } from "@/components/home/programs-grid";
import { Testimonials } from "@/components/home/testimonials";
import { CommunityStrip } from "@/components/home/community-strip";
import { CTABand } from "@/components/home/cta-band";
import { Banner } from "@/components/content/banner";
import { getPublishedTestimonials } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "SteerClub — Earn the Road.™ | India's Driving Confidence Platform",
  description:
    "Take your Steer Score — India's first driving competence benchmark. 30-minute in-vehicle assessment, structured programs, and a community of drivers who take their driving seriously.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let testimonials: { name: string; city: string | null; quote: string }[] = [];
  try {
    const rows = await getPublishedTestimonials();
    testimonials = rows.map((t) => ({ name: t.name, city: t.cityOrRole, quote: t.quote }));
  } catch {
    /* fall back to built-in testimonials */
  }

  return (
    <>
      <Banner placement="home" />
      <Hero />
      <ScoreIntro />
      <ProgramsGrid />
      <Testimonials items={testimonials.length > 0 ? testimonials : undefined} />
      <CommunityStrip />
      <CTABand />
    </>
  );
}
