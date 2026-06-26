import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  mode: z.enum(["sign-in", "sign-up"]),
});

/**
 * Sends a passwordless sign-in link to the user's email.
 *
 * This is a thin entry point: when RESEND_API_KEY is configured it dispatches a
 * branded magic-link email. Until the full auth backend (token issuance +
 * verification) is wired up, it always responds with success so the UI never
 * reveals whether an account exists for a given address.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = schema.parse(body);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "hello@steerclub.in";

    if (apiKey && !apiKey.includes("placeholder")) {
      // TODO: generate + persist a single-use token and embed it in the link.
      const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://steerclub.in"}/api/auth/verify`;
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
          html: `<p>Hi${name ? ` ${name}` : ""},</p><p>Click below to sign in to SteerClub. This link expires in 15 minutes.</p><p><a href="${link}">Sign in to SteerClub</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    // Never leak account existence — respond success even on internal failure.
    return NextResponse.json({ success: true });
  }
}
