import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — SteerClub",
  description: "How SteerClub collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[860px] section-pad">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
          Legal
        </p>
        <h1 className="font-heading font-black text-4xl text-white uppercase mb-4">
          Privacy Policy
        </h1>
        <p className="text-steel font-body text-sm mb-12">
          Last updated: June 2026
        </p>

        <div className="prose-sc space-y-10">
          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              1. Who We Are
            </h2>
            <p>
              SteerClub is operated by Steer Co. (registered in India). We run the Driving Confidence
              platform at steerclub.in, including assessments, programs, events, and the membership
              community. Our contact email is{" "}
              <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
                hello@steerclub.in
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              2. What We Collect
            </h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                "Name, email, and phone number when you book an assessment or program, sign up, or fill a form.",
                "Payment information — we do not store card details. Payments are processed by Razorpay.",
                "Assessment results (Steer Score and dimension data) linked to your account.",
                "Browsing behavior via cookies and analytics tools to improve site performance.",
                "Communications you initiate via WhatsApp or email.",
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
              3. How We Use Your Data
            </h2>
            <ul className="space-y-3 list-none pl-0">
              {[
                "To process bookings and send confirmations.",
                "To deliver your Steer Score report and program recommendations.",
                "To send updates about upcoming events, workshops, and new programs — you can unsubscribe at any time.",
                "To personalise your dashboard and track your progress.",
                "To improve our platform and diagnose technical issues.",
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
              4. Sharing Your Data
            </h2>
            <p>
              We do not sell your personal data. We may share data with:
            </p>
            <ul className="space-y-3 list-none pl-0 mt-4">
              {[
                "Razorpay — to process payments securely.",
                "Resend — to send transactional emails.",
                "WhatsApp Business API — for booking confirmations and notifications.",
                "Instructors assigned to your program — name and contact only, for session coordination.",
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
              5. Data Retention
            </h2>
            <p>
              We retain your account data for as long as your account is active. Assessment results
              are retained indefinitely to track your progress over time — you may request deletion
              at any time. Booking records are kept for seven years as required by Indian tax law.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              6. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management, and analytics
              cookies to understand how the site is used. You can disable non-essential cookies in
              your browser settings — the site will still function.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              7. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal data. Email{" "}
              <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
                hello@steerclub.in
              </a>{" "}
              with your request. We will respond within 15 business days.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
              8. Contact
            </h2>
            <p>
              For privacy questions:{" "}
              <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
                hello@steerclub.in
              </a>
              <br />
              Steer Co., Zirakpur, Punjab, India 140603
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-steel">
          <Link href="/terms" className="hover:text-lime transition-colors">Terms of Use</Link>
          <Link href="/refund" className="hover:text-lime transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-lime transition-colors">Back to SteerClub</Link>
        </div>
      </div>
    </div>
  );
}
