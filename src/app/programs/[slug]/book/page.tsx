import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROGRAMS, getProgramBySlug } from "@/lib/utils";
import ProgramBookingClient from "./booking-client";

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return {};
  return {
    title: `Book ${program.name} — SteerClub`,
    description: `Reserve your seat in the next ${program.name} cohort. ${program.sessions} sessions, ${program.durationHours} hours.`,
    robots: { index: false, follow: true },
  };
}

export default async function ProgramBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  return <ProgramBookingClient program={program} />;
}
