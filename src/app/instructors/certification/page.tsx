import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Award, BookOpen, Car, Users } from "lucide-react";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Instructor Certification — SteerClub",
  description:
    "Become a certified SteerClub instructor. Learn the Steer Score methodology and coach drivers the way it should be done.",
};

const STAGES = [
  {
    icon: BookOpen,
    title: "The Methodology",
    desc: "Learn the Steer Score framework — the six dimensions, how to assess each one objectively, and how to translate a number into a coaching plan.",
  },
  {
    icon: Car,
    title: "In-Vehicle Standard",
    desc: "Shadow senior instructors, then run supervised assessments and sessions. You're certified only when your scoring matches the SteerClub standard.",
  },
  {
    icon: Users,
    title: "Coaching Craft",
    desc: "Teaching capability is different from having it. Learn how to build confidence, give feedback that lands, and run a cohort that improves together.",
  },
  {
    icon: Award,
    title: "Certification & Chapter",
    desc: "Pass the final review and join a city chapter as a certified SteerClub instructor — with the brand, the standard, and the community behind you.",
  },
];

const REQUIREMENTS = [
  "Minimum 5 years of confident, incident-free driving experience",
  "Valid Indian driving licence (LMV; commercial endorsement a plus)",
  "Genuine belief that driving is a skill worth teaching properly",
  "Patience, clarity, and a calm presence in the passenger seat",
  "Willingness to be assessed against the SteerClub standard",
];

export default function InstructorCertificationPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <section className="section-pad">
        <div className="container max-w-[1440px]">
          <Link
            href="/instructors"
            className="text-xs font-ui text-steel hover:text-lime transition-colors mb-8 inline-block"
          >
            ← Our Instructors
          </Link>

          {/* Header */}
          <div className="max-w-3xl mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
              Instructor Certification
            </p>
            <h1 className="font-heading font-black text-section text-white uppercase mb-6">
              Earn the right to
              <br />
              <span className="text-lime">teach the road.</span>
            </h1>
            <p className="text-white/60 font-body text-lg leading-relaxed">
              SteerClub instructors aren&apos;t hired — they&apos;re certified. The same principle we
              apply to drivers applies to coaches: capability is earned, then proven. Here&apos;s how
              the certification works.
            </p>
          </div>

          {/* Stages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {STAGES.map((stage, i) => (
              <div key={stage.title} className="glass rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-heading font-black text-lime text-3xl">
                    0{i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-lg bg-lime/10 flex items-center justify-center">
                    <stage.icon className="w-5 h-5 text-lime" />
                  </div>
                </div>
                <h2 className="font-heading font-black text-xl text-white uppercase mb-3">
                  {stage.title}
                </h2>
                <p className="text-white/60 font-body leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* Requirements */}
          <div className="bg-lgrey rounded-2xl p-10 md:p-16 mb-16">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-8">
              What we look for
            </p>
            <div className="space-y-4">
              {REQUIREMENTS.map((req) => (
                <div key={req} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                  <p className="text-white/80 font-body text-lg">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-lime/20 p-10 text-center">
            <h2 className="font-heading font-black text-3xl text-white uppercase mb-4">
              Think you have the standard?
            </h2>
            <p className="text-white/50 font-body mb-6 max-w-lg mx-auto">
              Tell us about your driving and your interest in coaching. We&apos;ll set up a
              conversation and an assessment drive.
            </p>
            <a
              href={buildWhatsAppLink(WA_MESSAGES.generalEnquiry())}
              className="inline-flex items-center gap-2 bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase px-8 py-4 hover:bg-lime/90 transition-all"
            >
              Apply to Get Certified →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
