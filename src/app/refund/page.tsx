import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — SteerClub",
  description:
    "SteerClub's refund and rescheduling policy for assessments, programs, and memberships.",
};

const POLICY_ITEMS = [
  {
    category: "Steer Score Assessment (₹299)",
    rows: [
      { condition: "Cancellation 48+ hours before session", outcome: "Full refund" },
      { condition: "Cancellation 24–48 hours before session", outcome: "Reschedule credit (no cash refund)" },
      { condition: "Cancellation under 24 hours / no-show", outcome: "No refund" },
      { condition: "Session commenced", outcome: "No refund" },
      { condition: "SteerClub cancels the session", outcome: "Full refund or reschedule, your choice" },
    ],
  },
  {
    category: "Programs",
    rows: [
      { condition: "Cancellation 7+ days before cohort start", outcome: "Full refund" },
      { condition: "Cancellation 3–7 days before cohort start", outcome: "50% refund or full credit" },
      { condition: "Cancellation under 3 days before cohort start", outcome: "Credit only, no cash refund" },
      { condition: "After cohort has started", outcome: "No refund" },
      { condition: "SteerClub cancels / postpones cohort", outcome: "Full refund or reschedule" },
      { condition: "Medical emergency (documentation required)", outcome: "Full credit, no expiry" },
    ],
  },
  {
    category: "Membership",
    rows: [
      { condition: "Within 7 days of first charge, no sessions attended", outcome: "Full refund" },
      { condition: "After 7 days or after attending a session", outcome: "No refund — cancel for future billing" },
      { condition: "Annual plan within 30 days, no benefits used", outcome: "Pro-rata refund" },
    ],
  },
  {
    category: "Gift Bookings",
    rows: [
      { condition: "Gift code unused, cancellation within 30 days of purchase", outcome: "Full refund" },
      { condition: "Gift code unused, after 30 days", outcome: "Store credit" },
      { condition: "Gift code redeemed", outcome: "Follows standard policy for redeemed service" },
    ],
  },
];

export default function RefundPage() {
  return (
    <div className="pt-24 bg-asphalt min-h-screen">
      <div className="container max-w-[860px] section-pad">
        <p className="text-lime font-heading font-black text-xs tracking-[0.25em] uppercase mb-4">
          Legal
        </p>
        <h1 className="font-heading font-black text-4xl text-white uppercase mb-4">
          Refund Policy
        </h1>
        <p className="text-steel font-body text-sm mb-12">
          Last updated: June 2026 · Questions?{" "}
          <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
            hello@steerclub.in
          </a>
        </p>

        <div className="space-y-12">
          {POLICY_ITEMS.map((section) => (
            <div key={section.category}>
              <h2 className="font-heading font-black text-xl text-white uppercase mb-4">
                {section.category}
              </h2>
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3 w-1/2">
                        Situation
                      </th>
                      <th className="text-left font-ui text-xs uppercase tracking-widest text-steel px-4 py-3 w-1/2">
                        Outcome
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-white/70">{row.condition}</td>
                        <td className="px-4 py-3 text-white font-medium">{row.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white/5 rounded-lg border border-white/10">
          <h3 className="font-heading font-black text-white uppercase mb-2">How to Request a Refund</h3>
          <p className="text-white/70 font-body text-sm">
            Email{" "}
            <a href="mailto:hello@steerclub.in" className="text-lime hover:underline">
              hello@steerclub.in
            </a>{" "}
            with your booking reference and reason. Refunds are processed within 7–10 business days
            to the original payment method. Credits are applied to your account immediately.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-sm text-steel">
          <Link href="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-lime transition-colors">Terms of Use</Link>
          <Link href="/" className="hover:text-lime transition-colors">Back to SteerClub</Link>
        </div>
      </div>
    </div>
  );
}
