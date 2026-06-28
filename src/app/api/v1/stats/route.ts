import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, leads } from "@/lib/db/schema";
import { verifyApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sample programmatic endpoint guarded by an API key (Authorization: Bearer sk_...). */
export async function GET(req: Request) {
  const key = await verifyApiKey(req.headers.get("authorization"));
  if (!key) return new Response(JSON.stringify({ error: "Invalid or missing API key" }), { status: 401, headers: { "Content-Type": "application/json" } });

  const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const [l] = await db.select({ c: sql<number>`count(*)::int` }).from(leads);
  return Response.json({ ok: true, users: u?.c ?? 0, leads: l?.c ?? 0, scopes: key.scopes ?? [] });
}
