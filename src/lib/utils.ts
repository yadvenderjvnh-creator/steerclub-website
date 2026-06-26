import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Program, MembershipPlan } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PROGRAMS: Program[] = [
  {
    slug: "confidence-foundation",
    name: "Confidence Foundation™",
    tagline: "Your license was just the beginning.",
    description: "For the driver who has a license but hasn't truly driven. Structured first success in a safe, supportive cohort environment.",
    price: 599900,
    memberPrice: 509900,
    scoreRange: [0, 50],
    sessions: 4,
    durationHours: 8,
    campaignLine: "Your license was just the beginning.",
    forProfile: "You got your license. You haven't used it. The car sits in the driveway. You know you should drive — you just don't. This is where it starts.",
    outcomes: [
      "Start and park confidently in real traffic",
      "Handle lane changes without hesitation",
      "Drive solo on familiar city routes",
      "Understand what your score is measuring and why",
    ],
    cities: ["chandigarh", "delhi", "bangalore"],
  },
  {
    slug: "city-mastery",
    name: "City Mastery™",
    tagline: "The city doesn't forgive the unprepared. Be prepared.",
    description: "For the daily commuter who drives on autopilot. Close the gap between adequate and genuinely capable in Indian city conditions.",
    price: 799900,
    memberPrice: 679900,
    scoreRange: [45, 70],
    sessions: 5,
    durationHours: 10,
    campaignLine: "The city doesn't forgive the unprepared. Be prepared.",
    forProfile: "You drive every day. But parking still stresses you out. Merging in heavy traffic feels like a gamble. You avoid certain roads. That's not normal — it's fixable.",
    outcomes: [
      "Parallel park and reverse into tight spots with precision",
      "Read traffic 4–5 cars ahead and anticipate hazards",
      "Navigate roundabouts and intersections at speed",
      "Drive confidently in rain, peak-hour traffic, and at night",
    ],
    cities: ["chandigarh", "delhi", "bangalore", "mumbai"],
  },
  {
    slug: "highway-freedom",
    name: "Highway Freedom™",
    tagline: "Some roads ask more of you. Now you can give it.",
    description: "For the driver who avoids highways. Master merging at speed, sustained highway discipline, and overtaking safely.",
    price: 899900,
    memberPrice: 764900,
    scoreRange: [55, 75],
    sessions: 4,
    durationHours: 10,
    campaignLine: "Some roads ask more of you. Now you can give it.",
    forProfile: "You drive to work every day. But highway entries make you sweat. Merging at speed feels like a gamble. That's not a flaw — it's a gap. This program closes it.",
    outcomes: [
      "Merge onto a 100km/h highway without hesitation",
      "Hold lane discipline at sustained speed in heavy traffic",
      "Overtake safely and read traffic 5+ cars ahead",
      "Handle a tyre emergency at highway speed",
    ],
    cities: ["chandigarh", "delhi", "bangalore", "mumbai", "pune"],
  },
  {
    slug: "all-conditions",
    name: "All Conditions™",
    tagline: "Rain. Night. Mountain. Ready.",
    description: "For the driver who avoids specific conditions. Master wet roads, night driving, and difficult visibility scenarios.",
    price: 899900,
    memberPrice: 764900,
    scoreRange: [55, 80],
    sessions: 4,
    durationHours: 10,
    campaignLine: "Rain. Night. Mountain. Ready.",
    forProfile: "You drive fine in good conditions. But rain changes everything. Night driving feels uncertain. You know there are conditions you're not ready for. Now is when you get ready.",
    outcomes: [
      "Control the car on wet roads at normal driving speeds",
      "Understand stopping distances in rain and on slopes",
      "Navigate confidently in low-visibility conditions",
      "Handle a car when traction is compromised",
    ],
    cities: ["chandigarh", "delhi", "bangalore"],
  },
  {
    slug: "roadtrip-ready",
    name: "Roadtrip Ready™",
    tagline: "Ladakh isn't for everyone. It will be for you.",
    description: "For the road trip dreamer. Prepare for mountain roads, long-distance driving, and everything India's roads throw at you.",
    price: 1099900,
    memberPrice: 934900,
    scoreRange: [60, 100],
    sessions: 5,
    durationHours: 14,
    campaignLine: "Ladakh isn't for everyone. It will be for you.",
    forProfile: "You follow road trip accounts on Instagram. You've looked up Spiti Valley routes. You know you want it — you just don't feel ready yet. This program changes that.",
    outcomes: [
      "Navigate mountain passes and hairpin bends with control",
      "Plan and execute a 500km+ road trip independently",
      "Handle altitude changes, gradient descents, and narrow mountain roads",
      "Drive through the night safely over long distances",
    ],
    cities: ["chandigarh", "delhi"],
  },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    tier: "free",
    name: "Steer Free",
    monthlyPrice: null,
    annualPrice: 0,
    tagline: "Start here. Find out where you stand.",
    features: [
      "One Steer Score Assessment (standard)",
      "Community content and events feed (read-only)",
      "Monthly Road Notes newsletter",
      "Digital score report",
    ],
  },
  {
    tier: "member",
    name: "Steer Member",
    monthlyPrice: 79900,
    annualPrice: 749900,
    tagline: "The community, the events, the progress.",
    highlight: true,
    features: [
      "Annual Steer Score re-assessment",
      "Full community access (events, forums, city chapter)",
      "15% discount on all programs",
      "Monthly city drive access",
      "Skill workshops (monthly)",
      "Score progress tracking dashboard",
    ],
  },
  {
    tier: "pro",
    name: "Steer Pro",
    monthlyPrice: 199900,
    annualPrice: 1899900,
    tagline: "For drivers who are serious about improving.",
    features: [
      "Everything in Member",
      "2 practice sessions/month (with certified instructor)",
      "Priority booking on all programs",
      "Exclusive Pro events (track days, advanced workshops)",
      "Dedicated Pro community space",
      "Annual SteerClub kit (gear, pro card)",
    ],
  },
  {
    tier: "select",
    name: "Steer Select",
    monthlyPrice: null,
    annualPrice: 4999900,
    tagline: "Recognized. Challenged. Respected.",
    features: [
      "Everything in Pro",
      "Up to 4 practice sessions/month",
      "Guaranteed annual road trip spot (Ladakh/Spiti)",
      "Founding member status (first cohorts — permanent)",
      "1:1 annual review with senior instructor",
      "Name on SteerClub community wall",
      "Annual Select driver kit",
    ],
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

export function getRecommendedProgram(score: number): Program {
  return (
    PROGRAMS.find((p) => score >= p.scoreRange[0] && score <= (p.scoreRange[1] ?? 100)) ??
    PROGRAMS[0]
  );
}

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export const CITIES = [
  { value: "chandigarh", label: "Chandigarh / Zirakpur" },
  { value: "delhi", label: "Delhi NCR" },
  { value: "bangalore", label: "Bangalore" },
  { value: "mumbai", label: "Mumbai" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "pune", label: "Pune" },
  { value: "chennai", label: "Chennai" },
] as const;
