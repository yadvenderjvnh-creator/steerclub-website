/** Send a transactional email via Resend. No-op (logs) if Resend isn't configured. */
export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "SteerClub <hello@steerclub.in>";
  if (!apiKey || apiKey.includes("placeholder")) {
    console.log(`[email] (unconfigured) to=${opts.to} subject=${opts.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch (err) {
    console.error("sendEmail failed:", err);
    return false;
  }
}
