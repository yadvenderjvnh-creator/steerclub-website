import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { confirmPaidBooking } from "@/lib/finance/confirm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      bookingData,
    } = body;

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Single source of truth — shared with the Razorpay webhook fallback.
    await confirmPaidBooking({
      type,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      email: bookingData?.email,
      name: bookingData?.name,
      phone: bookingData?.phone,
      tier: body.tier,
      billing: body.billing,
      giftType: body.giftType,
      programSlug: body.programSlug,
      eventSlug: bookingData?.eventSlug,
      buyerName: bookingData?.buyerName,
      buyerEmail: bookingData?.buyerEmail,
      recipientName: bookingData?.recipientName,
      recipientEmail: bookingData?.recipientEmail,
    });

    // Optional WhatsApp confirmations (only when the Business number is configured).
    const waNumber = process.env.WHATSAPP_BUSINESS_NUMBER ?? "";
    if (waNumber && bookingData?.phone) {
      const msg =
        type === "assessment"
          ? `Hi ${bookingData.name}! Your SteerClub assessment is confirmed. Payment ID: ${razorpay_payment_id}. We'll contact you within 2 hours to confirm your instructor and session details. Earn the Road. — SteerClub Team`
          : type === "program"
            ? `Hi ${bookingData.name}! Your seat in the next SteerClub cohort is reserved. Payment ID: ${razorpay_payment_id}. We'll confirm your schedule and instructor within 24 hours. Earn the Road. — SteerClub Team`
            : type === "membership"
              ? `Hi ${bookingData.name}! Welcome to SteerClub. Your membership is active. Payment ID: ${razorpay_payment_id}. Member pricing now applies to every program you book. Earn the Road. — SteerClub Team`
              : null;
      if (msg) await sendWhatsAppNotification(bookingData.phone, msg);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
