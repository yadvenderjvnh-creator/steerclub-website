import Link from "next/link";
import { Instagram, Youtube, Linkedin } from "lucide-react";

const FOOTER_LINKS = {
  Score: [
    { label: "How It Works", href: "/score/how-it-works" },
    { label: "Book Assessment", href: "/score/book" },
    { label: "Score Results", href: "/dashboard/score" },
  ],
  Programs: [
    { label: "Confidence Foundation™", href: "/programs/confidence-foundation" },
    { label: "City Mastery™", href: "/programs/city-mastery" },
    { label: "Highway Freedom™", href: "/programs/highway-freedom" },
    { label: "All Conditions™", href: "/programs/all-conditions" },
    { label: "Roadtrip Ready™", href: "/programs/roadtrip-ready" },
  ],
  Community: [
    { label: "City Chapters", href: "/community" },
    { label: "Events", href: "/events" },
    { label: "Road Trips", href: "/events?type=road-trip" },
    { label: "Road Notes", href: "/road-notes" },
    { label: "Score Wall", href: "/community/wall" },
  ],
  Company: [
    { label: "Our Story", href: "/about/story" },
    { label: "Instructors", href: "/about/instructors" },
    { label: "Corporate", href: "/corporate" },
    { label: "Instructor Certification", href: "/instructors" },
    { label: "Gift a Program", href: "/gift" },
    { label: "Press", href: "/about/press" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-lgrey border-t border-white/8 pt-16 pb-8">
      <div className="container max-w-[1440px]">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-heading font-black text-2xl tracking-[0.08em] uppercase">
              Steer<span className="text-lime">Club</span>
            </Link>
            <p className="mt-4 text-steel text-sm leading-relaxed max-w-xs">
              India's Driving Confidence platform. The license was just the beginning.
            </p>
            <p className="mt-3 text-lime font-heading font-black text-sm tracking-widest uppercase">
              Earn the Road.™
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com/steerclub.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@steerclub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/steerclub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading font-black text-xs tracking-[0.12em] uppercase text-steel mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors font-ui"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities strip */}
        <div className="border-t border-white/8 pt-8 mb-8">
          <p className="text-xs text-steel font-ui mb-3 uppercase tracking-widest">Now in</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {["Chandigarh / Zirakpur", "Delhi NCR", "Bangalore", "Mumbai", "Hyderabad", "Pune", "Chennai"].map((city) => (
              <span key={city} className="text-sm text-white/50 font-ui">{city}</span>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-steel font-ui">
            © {new Date().getFullYear()} Steer Co. · All rights reserved · steerclub.in
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-steel hover:text-white transition-colors font-ui">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-steel hover:text-white transition-colors font-ui">
              Terms of Use
            </Link>
            <Link href="/refund" className="text-xs text-steel hover:text-white transition-colors font-ui">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
