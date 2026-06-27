import { createHmac, timingSafeEqual } from "node:crypto";
import { confirmPaidBooking } from "@/lib/finance/confirm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — reliability fallback for the client-side verify call.
 * On payment.captured / order.paid it idempotently confirms the matching booking
 * using the signed order `notes` we set in create-order. Configure the endpoint
 * + secret in the Razorpay dashboard and set RAZORPAY_WEBHOOK_SECRET in Vercel.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured yet — accept silently so Razorpay doesn't retry-storm.
    return new Response("ok", { status: 200 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } };
      order?: { entity?: { notes?: Record<string, string> } };
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const event = payload.event ?? "";
  if (event !== "payment.captured" && event !== "order.paid") {
    return new Response("ignored", { status: 200 });
  }

  const pay = payload.payload?.payment?.entity;
  const notes = pay?.notes ?? payload.payload?.order?.entity?.notes ?? {};
  const type = notes.type;
  const paymentId = pay?.id;

  if (!type || !paymentId) {
    return new Response("ok", { status: 200 });
  }

  try {
    await confirmPaidBooking({
      type,
      paymentId,
      orderId: pay?.order_id ?? null,
      email: notes.customerEmail,
      name: notes.customerName,
      tier: notes.tier,
      billing: notes.billing,
      giftType: notes.giftType,
      programSlug: notes.programSlug,
      eventSlug: notes.eventSlug,
      buyerName: notes.buyerName,
      buyerEmail: notes.buyerEmail,
      recipientName: notes.recipientName,
      recipientEmail: notes.recipientEmail,
      couponCode: notes.couponCode,
      couponDiscount: notes.couponDiscount ? Number(notes.couponDiscount) : null,
    });
  } catch (err) {
    console.error("razorpay webhook confirm failed:", err);
    // 200 anyway — confirmPaidBooking is idempotent and we don't want retry storms
    // for transient issues; real failures are logged.
  }

  return new Response("ok", { status: 200 });
}
