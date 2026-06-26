import type { Metadata } from "next";
import Link from "next/link";
import { Award, MapPin, Star } from "lucide-react";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Our Instructors — Certified SteerClub Coaches",
  description:
    "Every SteerClub instructor is certified through a rigorous standard. Meet the coaches behind India's Driving Confidence platform.",
};

type Instructor = {
  name: string;
  city: string;
  specialties: string[];
  years: number;
  sessions: number;
  bio: string;
};

const INSTRUCTORS: Instructor[] = [
  {
    name: "Yadvender Narang",
    city: "Chandigarh / Zirakpur",
    specialties: ["Highway Freedom™", "Roadtrip Ready™", "All Conditions™"],
    years: 12,
    sessions: 2400,
    bio: "Founder-instructor. Built the Steer Score methodology from a decade of coaching drivers who'd been failed by the standard test. Specialises in highway confidence and long-distance mountain driving.",
  },
  {
    name: "Senior Instructor — Delhi",
    city: "Delhi NCR",
    specialties: ["City Mastery™", "Confidence Foundation™"],
    years: 9,
    sessions: 1800,
    bio: "Master of the hardest traffic in India. Turns nervous first-time drivers into calm, decisive commuters who can handle anything Delhi throws at them.",
  },
  {
    name: "Senior Instructor — Bangalore",
    city: "Bangalore",
    specialties: ["All Conditions™", "City Mastery™"],
    years: 11,
    sessions: 2100,
    bio: "Rain, gridlock, and unpredictable junctions are the daily reality here. Specialises in all-conditions control and the calm reading of chaotic traffic.",
  },
  {
    name: "Senior Instructor — Mumbai",
    city: "Mumbai",
    specialties: ["City Mastery™", "Highway Freedom™"],
    years: 8,
    sessions: 1500,
    bio: "If you can park in Mumbai, you can park anywhere. Specialises in tight-space precision and confident merging on the city's flyovers and the Sea Link.",
  },
];

export default function InstructorsPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              The People Behind the Score
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              Coaching came first.
              <br />
              <span className="text-lime">These are the coaches.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              A SteerClub instructor is not a driving-school employee with a duster on the
              dashboard. Every coach is certified through a rigorous internal standard, trained on
              the Steer Score methodology, and held to the same standard we ask of you: capability,
              earned.
            </p>
          </div>

          {/* Instructors grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {INSTRUCTORS.map((instructor) => (
              <div
                key={instructor.name}
                className="glass rounded-2xl p-8 hover:border-lime/20 border border-transparent transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-lime/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-lime" />
                  </div>
                  <span className="text-xs font-ui uppercase tracking-widest text-lime bg-lime/10 px-3 py-1 rounded">
                    Certified
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl text-white uppercase mb-1">
                  {instructor.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-steel font-ui mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {instructor.city}
                </div>
                <p className="text-white/60 font-body text-sm leading-relaxed mb-6">
                  {instructor.bio}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {instructor.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-ui text-white/70 bg-white/5 px-3 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div>
                    <p className="font-heading font-black text-lg text-white">
                      {instructor.years} yrs
                    </p>
                    <p className="text-xs text-steel font-ui uppercase tracking-wide">Experience</p>
                  </div>
                  <div>
                    <p className="font-heading font-black text-lg text-white">
                      {instructor.sessions.toLocaleString("en-IN")}+
                    </p>
                    <p className="text-xs text-steel font-ui uppercase tracking-wide">Sessions</p>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-4 h-4 text-lime fill-lime" />
                    <span className="font-heading font-black text-white">4.9</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Become an instructor */}
          <div className="rounded-2xl border border-lime/20 p-10 md:p-16 text-center">
            <p className="font-heading font-black text-xs tracking-[0.25em] uppercase text-lime mb-4">
              Instructor Certification
            </p>
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Coach the way it should be done.
            </h2>
            <p className="text-white/50 font-body mb-8 max-w-xl mx-auto">
              We&apos;re building a network of certified instructors who believe driving is a skill
              worth teaching properly. If that&apos;s you, we want to talk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/instructors/certification"
                className="inline-flex items-center justify-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
              >
                Get Certified →
              </Link>
              <a
                href={buildWhatsAppLink(WA_MESSAGES.generalEnquiry())}
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:border-lime/50 hover:text-lime transition-all"
              >
                Ask a Question
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
