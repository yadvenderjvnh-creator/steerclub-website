import { createHmac } from "node:crypto";

function secret() {
  return process.env.AUTH_SECRET ?? "steerclub-dev-secret";
}

/** Deterministic, unguessable per-user token for the ICS feed (no DB storage). */
export function calendarToken(userId: string): string {
  const sig = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 32);
  return `${userId}.${sig}`;
}

export function verifyCalendarToken(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", secret()).update(userId).digest("hex").slice(0, 32);
  return sig === expected ? userId : null;
}
