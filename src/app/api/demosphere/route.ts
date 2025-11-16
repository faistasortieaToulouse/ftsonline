import { NextResponse } from "next/server";
import * as ical from "node-ical";

export async function GET() {
  try {
    const url = "https://toulouse.demosphere.net/events.ics";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();

    const data = ical.parseICS(icsText);

    const events = Object.values(data)
      .filter(ev => ev.type === "VEVENT")
      .map(ev => ({
        id: ev.uid,
        title: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location || null,
        description: ev.description || null,
        source: "Demosphere Toulouse (iCal)",
      }));

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Demosphere error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
