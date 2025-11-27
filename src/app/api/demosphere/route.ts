import { NextResponse } from "next/server";
import * as ical from "node-ical";

interface DemosphereEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string | null;
  description: string | null;
  source: string;
  url: string;
}

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

    const events: DemosphereEvent[] = Object.values(data)
      .filter((ev: any) => ev.type === "VEVENT")
      .map((ev: any) => ({
        id: ev.uid,
        title: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location || null,
        description: ev.description || null,
        source: "Demosphere (iCal)",
        url: ev.url || `https://toulouse.demosphere.net/rv/${ev.uid}`,
      }))
      // 🔹 Filtrage pour ne garder que les événements futurs
      .filter(ev => ev.start && new Date(ev.start) >= new Date())
      // 🔹 Tri chronologique
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Demosphere parse error:", err.message);
    return NextResponse.json([]);
  }
}
