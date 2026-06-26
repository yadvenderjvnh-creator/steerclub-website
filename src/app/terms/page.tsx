import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — SteerClub",
  description:
    "Terms governing your use of SteerClub's platform, assessments, programs, and community.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[860px] section-pad">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
          Legal
        </p>
        <h1 className="font-heading font-black text-4xl text-white uppercase mb-4">
          Terms of Use
        </h1>
        <p className="text-steel font-body text-sm mb-12">
          Last updated: June 2026
        </p>

        <div className="prose-sc space-y-10">
          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              1. Acceptance
            </h2>
            <p>
              By accessing or using steerclub.in, booking any assessment or program, or joining the
              SteerClub community, you agree to these Terms of Use. If you do not agree, do not use
              the platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              2. The Steer Score Assessment
            </h2>
            <p>
              The Steer Score is a structured in-vehicle evaluation conducted by a certified SteerClub
              instructor. It produces a score on a 0–100 scale across six dimensions of real driving
              capability.
            </p>
            <ul className="space-y-3 list-none pl-0 mt-4">
              {[
                "The assessment requires a valid Indian driving licence.",
                "The assessment must be completed within 60 days of booking. Extensions may be granted at our discretion.",
                "The assessment fee (₹299) is non-refundable once the session has commenced.",
                "The Steer Score is for educational and program-recommendation purposes only. It is not a legal document and does not replace or supersede any licence or certification issued by a government authority.",
                "SteerClub is not responsible for driving decisions made based on the score.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-white/70">
                  <span className="text-lime shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              3. Programs
            </h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                "Programs are cohort-based. Booking reserves a seat in a specific upcoming cohort.",
                "Programs require a current Steer Score within the recommended range. We may accept out-of-range bookings at our discretion.",
                "All session schedules are confirmed at least 7 days before cohort start.",
                "Missed sessions are not individually refunded. Please see the Refund Policy for rescheduling terms.",
                "SteerClub instructors are trained and certified. You will be notified of your instructor at least 48 hours before your first session.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-white/70">
                  <span className="text-lime shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              4. Membership
            </h2>
            <p>
              SteerClub memberships (Member, Pro, Select) are billed monthly or annually. You may
              cancel at any time — cancellation takes effect at the end of the current billing period.
              Membership fees are non-refundable except as described in the Refund Policy. Member
              discounts apply at the time of booking; they cannot be applied retroactively.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              5. Conduct
            </h2>
            <p>
              You agree not to:
            </p>
            <ul className="space-y-3 list-none pl-0 mt-4">
              {[
                "Use SteerClub for any unlawful purpose.",
                "Impersonate another person or misrepresent your identity or driving capability.",
                "Share your account credentials.",
                "Post harmful, abusive, or misleading content in any community space.",
                "Attempt to disrupt or gain unauthorised access to our systems.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-white/70">
                  <span className="text-lime shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              6. Intellectual Property
            </h2>
            <p>
              All content on steerclub.in — including the Steer Score methodology, program
              curricula, assessment frameworks, brand identity, and copy — is owned by Steer Co.
              You may not reproduce, distribute, or create derivative works without written
              permission.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              7. Liability
            </h2>
            <p>
              SteerClub provides driving coaching and education. We take every precaution during
              in-vehicle sessions. However, driving carries inherent risk and you participate at
              your own risk. SteerClub's liability is limited to the amount paid for the specific
              service in question.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              8. Changes to Terms
            </h2>
            <p>
              We may update these terms at any time. We will notify active users by email before
              material changes take effect. Continued use of the platform constitutes acceptance of
              the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              9. Governing Law
            </h2>
            <p>
              These terms are governed by Indian law. Any disputes are subject to the exclusive
              jurisdiction of courts in Chandigarh, Punjab.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              10. Contact
            </h2>
            <p>
              <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
                hello@steerclub.in
              </a>
              <br />
              Steer Co., Zirakpur, Punjab, India 140603
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-steel">
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-lime transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-lime transition-colors">Back to SteerClub</Link>
        </div>
      </div>
    </div>
  );
}
