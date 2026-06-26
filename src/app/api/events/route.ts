import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventRegistrations } from "@/lib/db/schema";
import { eq, gte, desc, and } from "drizzle-orm";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");

    const conditions = [
      eq(events.isPublished, true),
      gte(events.eventDate, new Date()),
    ];
    if (type) conditions.push(eq(events.type, type as "city-drive" | "workshop" | "road-trip" | "track-day" | "steerFest"));
    if (city) conditions.push(eq(events.city, city as "chandigarh" | "delhi" | "bangalore" | "mumbai" | "hyderabad" | "pune" | "chennai"));

    const results = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(events.eventDate)
      .limit(20);

    return NextResponse.json({ events: results });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
