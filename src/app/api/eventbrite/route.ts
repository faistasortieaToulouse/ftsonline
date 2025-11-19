import { NextResponse } from "next/server";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description?: { text: string };
  start: { local: string };
  end: { local: string };
  url: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Paramètres dynamiques avec valeurs par défaut
    const page = searchParams.get("page") || "1";
    const city = searchParams.get("city") || "Toulouse";
    const within = searchParams.get("within") || "50km";

    const token = process.env.EVENTBRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Token Eventbrite manquant" },
        { status: 500 }
      );
    }

    // URL Eventbrite API
    const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(
      city
    )}&location.within=${within}&page=${page}`;

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // évite la mise en cache côté Next.js
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Erreur API Eventbrite :", errText);
      return NextResponse.json(
        { error: "Erreur API Eventbrite", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();

    const events: EventbriteEvent[] = Array.isArray(data.events)
      ? data.events.map((ev: any) => ({
          id: ev.id,
          name: ev.name,
          description: ev.description,
          start: ev.start,
          end: ev.end,
          url: ev.url,
        }))
      : [];

    return NextResponse.json({
      events,
      total: data.pagination?.object_count ?? events.length,
      page: data.pagination?.page_number ?? page,
    });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: (error as Error).message },
      { status: 500 }
    );
  }
}
