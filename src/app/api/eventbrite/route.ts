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
    const page = searchParams.get("page") || "1";

    const token = process.env.EVENTBRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Token Eventbrite manquant" },
        { status: 500 }
      );
    }

    // ⚠️ Correction : ajout du slash après "search/"
// AVANT :
// const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?location.address=Toulouse&location.within=50km&page=${page}`;
// APRÈS : Utilisez simplement l'endpoint 'events/search' sans slash de fin,
// et assurez-vous que tous les paramètres suivent le point d'interrogation.
// Ancienne ligne (à remplacer) :
// const apiUrl = `https://www.eventbriteapi.com/v3/events/search?location.address=Toulouse&location.within=50km&page=${page}`;

// NOUVELLE LIGNE SIMPLIFIÉE (pour test) :
const apiUrl = `https://www.eventbriteapi.com/v3/events/search/?q=Toulouse&page=${page}`;

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

    const events: EventbriteEvent[] = (data.events || []).map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      description: ev.description,
      start: ev.start,
      end: ev.end,
      url: ev.url,
    }));

    return NextResponse.json({
      events,
      total: data.pagination?.object_count || events.length,
      page: data.pagination?.page_number || page,
    });
  } catch (error) {
    console.error("🔥 Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
