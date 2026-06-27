import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins, Inter } from "next/font/google";
import "./globals.css";
import { SiteFrame } from "@/components/layout/site-frame";
import { SchemaMarkup } from "@/components/shared/schema-markup";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://steerclub.in"),
  title: {
    default: "SteerClub — Earn the Road.™ | India's Driving Confidence Platform",
    template: "%s | SteerClub",
  },
  description:
    "SteerClub is India's first Driving Confidence platform. Take your Steer Score assessment, join structured programs, and become the kind of driver you're proud to be. Starting at ₹299.",
  keywords: [
    "driving confidence", "steer score", "driving training india",
    "how to drive better", "driving anxiety", "driving classes chandigarh",
    "advanced driving india", "driving certification india", "driving programs",
    "earn the road", "steerclub",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://steerclub.in",
    siteName: "SteerClub",
    title: "SteerClub — Earn the Road.™",
    description: "India's first Driving Confidence platform. Know your Steer Score. Build genuine capability. Join a community of drivers who take their driving seriously.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteerClub — Earn the Road.™",
    description: "India's first Driving Confidence platform. Take your Steer Score.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "https://steerclub.in" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${inter.variable}`}>
      <body>
        <SchemaMarkup />
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
