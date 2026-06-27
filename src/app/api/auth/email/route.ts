import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLoginToken } from "@/lib/auth/tokens";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  mode: z.enum(["sign-in", "sign-up"]).optional(),
  next: z.string().optional(),
});

/**
 * Issues a single-use magic-link token and emails it via Resend.
 * Always responds success so the UI never reveals whether an account exists.
 * In development (or when RESEND is unconfigured) the link is returned/logged
 * so the flow can be tested without an email provider.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, next } = schema.parse(body);

    const raw = await createLoginToken(email);
    const origin = new URL(req.url).origin;
    const link = `${origin}/api/auth/verify?token=${raw}${
      next ? `&next=${encodeURIComponent(next)}` : ""
    }`;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "hello@steerclub.in";
    const isConfigured = apiKey && !apiKey.includes("placeholder");

    if (isConfigured) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: "Your SteerClub sign-in link",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#111">Sign in to SteerClub</h2>
            <p>Click below to sign in. This link expires in 15 minutes and can be used once.</p>
            <p><a href="${link}" style="display:inline-block;background:#D7FF2F;color:#111;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px">Sign in to SteerClub</a></p>
            <p style="color:#707070;font-size:13px">If you didn't request this, you can ignore this email.</p>
          </div>`,
        }),
      });
    } else {
      // No email provider configured — log so the link is testable.
      console.log(`[auth] magic link for ${email}: ${link}`);
    }

    // Expose the link in the response only outside production (local testing).
    const devLink = process.env.NODE_ENV !== "production" ? link : undefined;
    return NextResponse.json({ success: true, ...(devLink ? { devLink } : {}) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Never leak account existence — respond success even on internal failure.
    return NextResponse.json({ success: true });
  }
}
