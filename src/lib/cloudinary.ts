import { createHash } from "node:crypto";

/**
 * Cloudinary upload helper — uses a SEPARATE Cloudinary account from any MCP
 * integration. Credentials come from env (set in Vercel; never in code):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * No-ops (returns null) if unconfigured, mirroring src/lib/email.ts.
 */
export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/** Sign the params for a Cloudinary signed upload (sha1 of sorted params + secret). */
function sign(params: Record<string, string>, secret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/**
 * Upload an image to Cloudinary and return its `secure_url`.
 * `file` may be a data URI, a remote URL, or base64 — Cloudinary accepts all.
 * Returns null if Cloudinary isn't configured or the upload fails.
 */
export async function uploadToCloudinary(
  file: string,
  opts: { folder?: string } = {}
): Promise<string | null> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    console.log("[cloudinary] (unconfigured) upload skipped");
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = opts.folder ?? "steerclub/community";
  const signature = sign({ folder, timestamp }, apiSecret);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      console.error("[cloudinary] upload failed:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { secure_url?: string };
    return data.secure_url ?? null;
  } catch (err) {
    console.error("[cloudinary] upload error:", err);
    return null;
  }
}
