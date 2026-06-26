import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { assessmentBookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

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

    if (type === "assessment") {
      await db
        .update(assessmentBookings)
        .set({
          status: "confirmed",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          confirmedAt: new Date(),
        })
        .where(eq(assessmentBookings.email, bookingData.email));

      const waNumber = process.env.WHATSAPP_BUSINESS_NUMBER ?? "";
      if (waNumber) {
        await sendWhatsAppNotification(
          bookingData.phone,
          `Hi ${bookingData.name}! Your SteerClub assessment is confirmed. ` +
          `Payment ID: ${razorpay_payment_id}. ` +
          `We'll contact you within 2 hours to confirm your instructor and session details. ` +
          `Earn the Road. — SteerClub Team`
        );
      }
    } else if (type === "program" && bookingData?.phone) {
      const waNumber = process.env.WHATSAPP_BUSINESS_NUMBER ?? "";
      if (waNumber) {
        await sendWhatsAppNotification(
          bookingData.phone,
          `Hi ${bookingData.name}! Your seat in the next SteerClub cohort is reserved. ` +
          `Payment ID: ${razorpay_payment_id}. ` +
          `We'll confirm your schedule and instructor within 24 hours. ` +
          `Earn the Road. — SteerClub Team`
        );
      }
    } else if (type === "membership" && bookingData?.phone) {
      const waNumber = process.env.WHATSAPP_BUSINESS_NUMBER ?? "";
      if (waNumber) {
        await sendWhatsAppNotification(
          bookingData.phone,
          `Hi ${bookingData.name}! Welcome to SteerClub. Your membership is active. ` +
          `Payment ID: ${razorpay_payment_id}. ` +
          `Member pricing now applies to every program you book. ` +
          `Earn the Road. — SteerClub Team`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
