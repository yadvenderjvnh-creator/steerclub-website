import type { Metadata } from "next";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { MEMBERSHIP_PLANS, formatINR } from "@/lib/utils";
import { buildWhatsAppLink, WA_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Membership — Steer Free, Member, Pro, Select",
  description:
    "Join SteerClub. Four membership tiers from free to Select. Community access, monthly events, practice sessions, road trips, and the Steer Score app. From ₹799/month.",
};

export default function MembershipPage() {
  return (
    <div className="pt-24 bg-asphalt">
      {/* Header */}
      <section className="section-pad pb-12">
        <div className="container max-w-[1440px] text-center">
          <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
            Membership
          </p>
          <h1 className="font-heading font-black text-section text-white uppercase mb-6">
            Your score tells you what you need.
            <br />
            <span className="text-lime">Your tier determines how far you go.</span>
          </h1>
          <p className="text-white/60 font-body text-lg max-w-2xl mx-auto">
            Programs are how you enter. Membership is how you stay.
            The community, the events, the road trips — this is where SteerClub actually lives.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="container max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {MEMBERSHIP_PLANS.map((plan) => (
              <div
                key={plan.tier}
                id={plan.tier}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? "bg-lime text-asphalt"
                    : plan.tier === "select"
                    ? "bg-graphite border border-white/20"
                    : "glass"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-asphalt text-lime text-xs font-heading font-black uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                {plan.tier === "select" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-3.5 h-3.5 text-lime fill-lime" />
                    <span className="text-xs font-ui uppercase tracking-widest text-lime">Invitation Only</span>
                  </div>
                )}

                <div className="mb-5">
                  <h2
                    className={`font-heading font-black text-xl uppercase mb-1 ${
                      plan.highlight ? "text-asphalt" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </h2>
                  <p
                    className={`text-xs font-ui leading-relaxed ${
                      plan.highlight ? "text-asphalt/70" : "text-steel"
                    }`}
                  >
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.annualPrice === 0 ? (
                    <p className={`font-heading font-black text-4xl ${plan.highlight ? "text-asphalt" : "text-white"}`}>
                      Free
                    </p>
                  ) : (
                    <>
                      {plan.monthlyPrice && (
                        <p className={`font-heading font-black text-3xl ${plan.highlight ? "text-asphalt" : "text-white"}`}>
                          {formatINR(plan.monthlyPrice)}
                          <span className="text-sm font-ui font-normal opacity-70">/mo</span>
                        </p>
                      )}
                      <p
                        className={`text-xs font-ui mt-1 ${
                          plan.highlight ? "text-asphalt/60" : "text-steel"
                        }`}
                      >
                        or {formatINR(plan.annualPrice)}/year
                        {plan.monthlyPrice && " (save 2 months)"}
                      </p>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlight ? "text-asphalt" : "text-lime"
                        }`}
                      />
                      <span
                        className={`text-sm font-ui ${
                          plan.highlight ? "text-asphalt/80" : "text-white/70"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.tier === "free" ? (
                  <Link
                    href="/score/book"
                    className="block w-full text-center border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase py-3 hover:border-white/50 transition-colors"
                  >
                    Start with Assessment
                  </Link>
                ) : plan.tier === "select" ? (
                  <a
                    href={buildWhatsAppLink(WA_MESSAGES.membershipEnquiry("Select"))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center border border-lime/40 text-lime font-heading font-black text-sm tracking-wide uppercase py-3 hover:bg-lime/10 transition-colors"
                  >
                    Enquire →
                  </a>
                ) : (
                  <Link
                    href={`/membership/${plan.tier}/join`}
                    className={`block w-full text-center font-heading font-black text-sm tracking-wide uppercase py-3 transition-colors ${
                      plan.highlight
                        ? "bg-asphalt text-white hover:bg-graphite"
                        : "bg-lime text-asphalt hover:bg-lime/90"
                    }`}
                  >
                    Start as {plan.name.split(" ")[1]}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Select tier — narrative section */}
      <section className="py-20 bg-lgrey border-t border-white/8">
        <div className="container max-w-[1440px]">
          <div className="max-w-2xl mx-auto">
            <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-6">
              SteerClub Select
            </p>
            <blockquote className="font-body text-xl text-white/80 leading-relaxed italic mb-8">
              "There are drivers. And there are drivers.
              <br /><br />
              Most people who hold a license belong to the first group. They move from one place to another.
              They are adequate. They are legal.
              <br /><br />
              A smaller group decided, at some point, that adequate wasn't the standard they held themselves to.
              <br /><br />
              SteerClub Select is for this group."
            </blockquote>
            <p className="text-white/50 font-body mb-6">
              Select is not a subscription. It is an acknowledgment.
              Limited seats per city. Offered to members who demonstrate the commitment.
            </p>
            <a
              href={buildWhatsAppLink(WA_MESSAGES.membershipEnquiry("Select"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-heading font-black text-sm tracking-wide uppercase px-6 py-3 hover:border-lime/50 hover:text-lime transition-all"
            >
              Enquire about Select →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-asphalt">
        <div className="container max-w-[1440px] max-w-3xl mx-auto">
          <h2 className="font-heading font-black text-2xl text-white uppercase mb-10">
            Membership Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I join without doing an assessment first?",
                a: "You can join Steer Free without an assessment. For Member, Pro, and Select tiers, we recommend taking the assessment first — your score helps us personalise your experience and recommend the right programs.",
              },
              {
                q: "What happens after I complete a program?",
                a: "Program completion is the highest-intent moment to join a membership. We'll make you a specific offer based on your score improvement and what Member or Pro access unlocks for your next steps.",
              },
              {
                q: "Can I cancel my membership?",
                a: "Monthly memberships can be cancelled any time. Annual memberships are non-refundable after the first 7 days, but can be paused for up to 3 months.",
              },
              {
                q: "How does membership discount on programs work?",
                a: "Members automatically receive 15% off all programs at checkout. Applied to the current program price at the time of booking.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-white/10 pb-6">
                <h3 className="font-heading font-black text-white text-sm uppercase tracking-wide mb-2">
                  {item.q}
                </h3>
                <p className="text-white/60 font-body text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
