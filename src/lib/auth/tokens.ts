import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginTokens } from "@/lib/db/schema";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Create a single-use login token for an email; returns the raw token to embed in the magic link. */
export async function createLoginToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  await db.insert(loginTokens).values({
    identifier: email.toLowerCase().trim(),
    tokenHash,
    expires,
  });
  return raw;
}

/**
 * Validate and consume a login token.
 * Returns the identifier (email) if valid/unexpired/unused, else null.
 */
export async function consumeLoginToken(raw: string): Promise<string | null> {
  if (!raw) return null;
  const tokenHash = hashToken(raw);
  const rows = await db
    .select()
    .from(loginTokens)
    .where(eq(loginTokens.tokenHash, tokenHash))
    .limit(1);
  const token = rows[0];
  if (!token) return null;
  if (token.consumedAt) return null;
  if (token.expires.getTime() < Date.now()) return null;
  await db
    .update(loginTokens)
    .set({ consumedAt: new Date() })
    .where(eq(loginTokens.id, token.id));
  return token.identifier;
}
