import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ScoreIntro } from "@/components/home/score-intro";
import { ProgramsGrid } from "@/components/home/programs-grid";
import { Testimonials } from "@/components/home/testimonials";
import { CommunityStrip } from "@/components/home/community-strip";
import { CTABand } from "@/components/home/cta-band";

export const metadata: Metadata = {
  title: "SteerClub — Earn the Road.™ | India's Driving Confidence Platform",
  description:
    "Take your Steer Score — India's first driving competence benchmark. 30-minute in-vehicle assessment, structured programs, and a community of drivers who take their driving seriously.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ScoreIntro />
      <ProgramsGrid />
      <Testimonials />
      <CommunityStrip />
      <CTABand />
    </>
  );
}
