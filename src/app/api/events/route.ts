import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events";

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
