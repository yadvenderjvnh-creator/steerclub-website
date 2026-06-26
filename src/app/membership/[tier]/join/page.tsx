import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MEMBERSHIP_PLANS } from "@/lib/utils";
import MembershipJoinClient from "./join-client";

export function generateStaticParams() {
  // Only paid, self-serve tiers — free starts with assessment, select is enquiry-only
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
    title: `Join ${plan.name} — SteerClub`,
    description: plan.tagline,
    robots: { index: false, follow: true },
  };
}

export default async function MembershipJoinPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  const plan = MEMBERSHIP_PLANS.find((p) => p.tier === tier);
  if (!plan || (plan.tier !== "member" && plan.tier !== "pro")) notFound();

  return <MembershipJoinClient plan={plan} />;
}
