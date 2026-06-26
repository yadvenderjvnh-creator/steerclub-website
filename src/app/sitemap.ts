import type { MetadataRoute } from "next";
import { PROGRAMS } from "@/lib/utils";

const BASE = "https://steerclub.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/score`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/score/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/score/book`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/programs`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/membership`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/community/wall`, lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: `${BASE}/events`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/road-notes`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/corporate`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/gift`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/instructors`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/instructors/certification`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const programPages: MetadataRoute.Sitemap = PROGRAMS.map((p) => ({
    url: `${BASE}/programs/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Only chapters with live pages — others route to the waitlist.
  const cityPages: MetadataRoute.Sitemap = [
    "chandigarh", "delhi", "bangalore", "mumbai",
  ].map((city) => ({
    url: `${BASE}/community/${city}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...programPages, ...cityPages];
}
