import type { Metadata } from "next";
import Link from "next/link";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Corporate Driving Confidence Programs — SteerClub",
  description:
    "SteerClub corporate programs for field sales teams, D&I initiatives, fleet operators, and HR wellness programs. Measurable driving capability for your workforce.",
};

export default function CorporatePage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[1440px] section-pad">
        <div className="max-w-3xl">
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
            Corporate
          </p>
          <h1 className="font-heading font-black text-section text-white uppercase mb-6">
            Driving confidence is not
            <br />
            <span className="text-lime">a soft skill.</span>
          </h1>
          <p className="text-white/60 font-body text-xl leading-relaxed mb-12">
            It is a capability gap that costs companies in productivity, stress, and safety.
            We have the only measurable solution: the Steer Score, applied at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {[
            {
              title: "Field Sales Teams",
              desc: "Your reps drive to client meetings. Their capability behind the wheel reflects on your brand. The Steer Score benchmarks them. Programs close the gaps.",
              range: "₹25,000–₹1,00,000",
            },
            {
              title: "D&I Driving Initiative",
              desc: "Driving confidence as a meaningful D&I program for female employees. Community support, evening cohorts, safety-first environment.",
              range: "₹40,000–₹2,00,000",
            },
            {
              title: "Fleet Certification",
              desc: "Certify your fleet drivers against the Steer Score standard. Annual re-assessment included. Documented capability for compliance.",
              range: "Custom pricing",
            },
            {
              title: "Employee Wellness",
              desc: "Driving confidence alongside mental health and fitness as part of a corporate wellness program. Measurable, appreciated, differentiated.",
              range: "₹30,000–₹1,50,000",
            },
            {
              title: "New Graduate Cohorts",
              desc: "Campus-to-city transitions. Young professionals who drive but have never driven in real conditions. Cohort programs with certification.",
              range: "₹20,000–₹80,000",
            },
            {
              title: "Gift Programs",
              desc: "Gift your employees or their families a Steer Score assessment or program. Parental benefit. Corporate gifting at scale.",
              range: "From ₹299/person",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl p-6">
              <h3 className="font-heading font-black text-base text-white uppercase mb-2">{item.title}</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed mb-4">{item.desc}</p>
              <p className="text-xs font-ui text-lime">{item.range}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 md:p-12 max-w-2xl">
          <h2 className="font-heading font-black text-2xl text-white uppercase mb-4">
            Start the Conversation
          </h2>
          <p className="text-white/60 font-body mb-8">
            Tell us about your organisation and what you're trying to solve.
            We'll build a proposal specific to your context.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={buildWhatsAppLink(WA_MESSAGES.corporateEnquiry())}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-lime text-asphalt font-heading font-black text-sm tracking-wide uppercase py-4 hover:bg-lime/90 transition-colors"
            >
              WhatsApp Enquiry
            </a>
            <Link
              href="mailto:corporate@steerclub.in"
              className="flex-1 text-center border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase py-4 hover:border-white/50 transition-colors"
            >
              Email Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
