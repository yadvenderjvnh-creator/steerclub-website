import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlist } from "@/lib/db/schema";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().optional(),
  type: z.string(),
  city: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await db.insert(waitlist).values({
      email: data.email,
      phone: data.phone,
      name: data.name,
      type: data.type,
      city: (data.city as "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai" | null | undefined),
      source: data.source,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}
