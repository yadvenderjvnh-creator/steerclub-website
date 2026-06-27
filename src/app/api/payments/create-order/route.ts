import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createOrder, PRICES } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { assessmentBookings, programBookings, programs } from "@/lib/db/schema";
import { getProgramBySlug } from "@/lib/utils";
import { upsertLeadFromContact } from "@/lib/portal/leads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, customerData, programSlug, isMember, tier, billing, giftType } = body;

    let amount: number;
    let receipt: string;
    let notes: Record<string, string>;

    if (type === "assessment") {
      amount = PRICES.assessment;
      receipt = `asmt_${Date.now()}`;
      notes = {
        type: "assessment",
        customerName: customerData.name,
        customerEmail: customerData.email,
        city: customerData.city,
      };

      await db.insert(assessmentBookings).values({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        city: customerData.city,
        notes: customerData.notes,
        carOwned: customerData.carOwned ?? true,
        preferredDate: customerData.preferredDate ? new Date(customerData.preferredDate) : null,
        amount,
        status: "pending",
      });
    } else if (type === "program") {
      const program = getProgramBySlug(programSlug);
      if (!program) {
        return NextResponse.json({ error: "Unknown program" }, { status: 400 });
      }
      // Honor member pricing so the charge matches what the booking UI shows.
      amount = isMember ? program.memberPrice : program.price;
      receipt = `prog_${Date.now()}`;
      notes = {
        type: "program",
        programSlug: program.slug,
        memberPrice: isMember ? "yes" : "no",
        customerName: customerData.name,
        customerEmail: customerData.email,
        city: customerData.city,
      };

      // Persist a pending enrollment (resolve the seeded program row by slug).
      const progRows = await db
        .select({ id: programs.id })
        .from(programs)
        .where(eq(programs.slug, program.slug))
        .limit(1);
      if (progRows[0]) {
        await db.insert(programBookings).values({
          programId: progRows[0].id,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          city: customerData.city,
          amount,
          isMemberPrice: Boolean(isMember),
          status: "pending",
        });
      }
    } else if (type === "membership") {
      const membershipAmount = membershipPrice(tier, billing);
      if (membershipAmount === null) {
        return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 });
      }
      amount = membershipAmount;
      receipt = `memb_${Date.now()}`;
      notes = {
        type: "membership",
        tier,
        billing: billing ?? "annual",
        customerName: customerData.name,
        customerEmail: customerData.email,
        city: customerData.city ?? "",
      };
    } else if (type === "gift") {
      if (giftType === "membership") {
        // Memberships are gifted as a full annual term.
        const giftAmount = membershipPrice(tier, "annual");
        if (giftAmount === null) {
          return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 });
        }
        amount = giftAmount;
        notes = {
          type: "gift",
          giftType: "membership",
          tier,
          buyerName: customerData.buyerName,
          buyerEmail: customerData.buyerEmail,
          recipientName: customerData.recipientName,
          recipientEmail: customerData.recipientEmail,
        };
      } else if (giftType === "program") {
        const program = getProgramBySlug(programSlug);
        if (!program) {
          return NextResponse.json({ error: "Unknown program" }, { status: 400 });
        }
        amount = program.price;
        notes = {
          type: "gift",
          giftType: "program",
          programSlug: program.slug,
          buyerName: customerData.buyerName ?? customerData.name ?? "",
          buyerEmail: customerData.buyerEmail ?? customerData.email ?? "",
          recipientName: customerData.recipientName ?? "",
          recipientEmail: customerData.recipientEmail ?? "",
        };
      } else {
        return NextResponse.json({ error: "Invalid gift type" }, { status: 400 });
      }
      receipt = `gift_${Date.now()}`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Capture every booker as a CRM lead (de-duped by email) so the team can
    // follow up in /admin/leads — including guests who never create an account.
    const isGift = type === "gift";
    await upsertLeadFromContact({
      name: isGift ? customerData?.buyerName : customerData?.name,
      email: isGift ? customerData?.buyerEmail : customerData?.email,
      phone: isGift ? customerData?.buyerPhone : customerData?.phone,
      city: isGift ? null : customerData?.city,
      source:
        type === "assessment"
          ? "assessment-booking"
          : type === "program"
            ? "program-booking"
            : type === "membership"
              ? "membership"
              : "gift",
    });

    const order = await createOrder(amount, receipt, notes);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

function membershipPrice(
  tier: string,
  billing: string
): number | null {
  const map: Record<string, { monthly: number | null; annual: number }> = {
    member: { monthly: PRICES.membershipMemberMonthly, annual: PRICES.membershipMemberAnnual },
    pro: { monthly: PRICES.membershipProMonthly, annual: PRICES.membershipProAnnual },
    select: { monthly: null, annual: PRICES.membershipSelectAnnual },
  };
  const plan = map[tier];
  if (!plan) return null;
  if (billing === "monthly") return plan.monthly;
  return plan.annual;
}
