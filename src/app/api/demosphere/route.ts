import { NextResponse } from "next/server";
import * as ical from "node-ical";

export async function GET() {
  const url = "https://toulouse.demosphere.net/events.ics";

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("❌ Demosphere HTTP error:", res.status, res.statusText);
      return NextResponse.json([]);
    }

    const icsText = await res.text();
    const data = ical.parseICS(icsText);

    const events = Object.values(data)
      .filter((ev: any) => ev.type === "VEVENT")
      .map((ev: any) => ({
        id: ev.uid,
        title: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location || null,
        description: ev.description || null,
        source: "Demosphere (iCal)",
        url: ev.url || `https://toulouse.demosphere.net/rv/${ev.uid}`, // ← ajout de l’URL
      }));

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Demosphere parse error:", err.message);
    return NextResponse.json([]);
  }
}
