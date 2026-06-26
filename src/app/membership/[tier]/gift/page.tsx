import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MEMBERSHIP_PLANS } from "@/lib/utils";
import MembershipGiftClient from "./gift-client";

export function generateStaticParams() {
  return MEMBERSHIP_PLANS.filter((p) => p.tier === "member" || p.tier === "pro").map((p) => ({
    tier: p.tier,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string }>;
}): Promise<Metadata> {
  const { tier } = await params;
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  if (!plan) return {};
  return {
    title: `Gift ${plan.name} — SteerClub`,
    description: `Give the gift of driving confidence. ${plan.tagline}`,
    robots: { index: false, follow: true },
  };
}

export default async function MembershipGiftPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  if (!plan || (plan.tier !== "member" && plan.tier !== "pro")) notFound();

  return <MembershipGiftClient plan={plan} />;
}
