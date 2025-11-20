import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TICKETMASTER_KEY;
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=FR&size=10`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Erreur Ticketmaster" }, { status: res.status });
    }

    const data = await res.json();

    const events = data._embedded?.events?.map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      date: ev.dates?.start?.localDate,
      venue: ev._embedded?.venues?.[0]?.name,
      city: ev._embedded?.venues?.[0]?.city?.name,
      url: ev.url,
      description: ev.info || ev.pleaseNote || "", // champ description
      image: ev.images?.[0]?.url || null,          // première image
    })) || [];

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur", details: String(error) }, { status: 500 });
  }
}
