import { NextResponse } from "next/server";
import * as ical from "node-ical";

export async function GET() {
  try {
    const url = "https://www.cultureenmouvements.org/agenda?ical=1";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const icsText = await res.text();

    const data = ical.parseICS(icsText);

    const events = Object.values(data)
      .filter(ev => ev.type === "VEVENT")
      .filter(ev => {
        const postal = ev.location || "";
        return postal.includes("31"); // filtrage Haute-Garonne
      })
      .map(ev => ({
        id: ev.uid,
        title: ev.summary,
        start: ev.start,
        end: ev.end,
        location: ev.location || null,
        description: ev.description || null,
        source: "Culture en Mouvements (iCal)",
      }));

    return NextResponse.json(events, { status: 200 });
  } catch (err: any) {
    console.error("Culture en Mouvements error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
