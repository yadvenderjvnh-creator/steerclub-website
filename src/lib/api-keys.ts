import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Create an API key. Returns the plaintext token ONCE (store hash only). */
export async function createApiKey(name: string, scopes: string[], createdById?: string) {
  const token = `sk_${randomBytes(24).toString("hex")}`;
  const prefix = token.slice(0, 10);
  await db.insert(apiKeys).values({ name, prefix, tokenHash: hash(token), scopes, createdById: createdById ?? null });
  return { token, prefix };
}

/** Verify a bearer token → the key row (and bump lastUsedAt), or null. */
export async function verifyApiKey(token: string | null | undefined) {
  if (!token) return null;
  const t = token.replace(/^Bearer\s+/i, "").trim();
  if (!t.startsWith("sk_")) return null;
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.tokenHash, hash(t)), isNull(apiKeys.revokedAt)))
    .limit(1);
  if (!row) return null;
  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return row;
}
