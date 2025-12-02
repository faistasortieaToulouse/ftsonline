import { NextResponse } from "next/server";

// Endpoint: /api/agendaculturel
// Fetch events from Agenda Culturel, normalize them, and return JSON

export async function GET() {
  try {
    const url = "https://31.agendaculturel.fr/rss";
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
    }

    const data = await res.json();

    // Normalisation minimale
    const events = Array.isArray(data?.events)
      ? data.events.map((evt: any) => ({
          id: evt.id,
          title: evt.title ?? null,
          description: evt.description ?? null,
          date: evt.date_start ?? evt.date ?? null,
          location: evt.location ?? null,
          image: evt.image ?? null,
          url: evt.url ?? null,
        }))
      : [];

    return NextResponse.json({ count: events.length, events });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur", details: String(err) }, { status: 500 });
  }
}
