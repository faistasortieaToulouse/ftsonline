import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.TICKETMASTER_KEY;

  // 👉 Liste des villes principales de Haute-Garonne
  const cities = ["Toulouse", "Colomiers", "Blagnac", "Muret"];

  try {
    // On fait un appel pour chaque ville en parallèle
    const responses = await Promise.all(
      cities.map(city =>
        fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=FR&city=${encodeURIComponent(
            city
          )}&size=20`,
          { cache: "no-store" }
        )
      )
    );

    // On récupère les JSON
    const datas = await Promise.all(responses.map(res => res.json()));

    // Fusion des événements
    const events: any[] = [];
    datas.forEach(data => {
      const evs =
        data._embedded?.events?.map((ev: any) => ({
          id: ev.id,
          name: ev.name,
          date: ev.dates?.start?.localDate,
          venue: ev._embedded?.venues?.[0]?.name,
          city: ev._embedded?.venues?.[0]?.city?.name,
          url: ev.url,
          description: ev.info || ev.pleaseNote || "",
          image: ev.images?.[0]?.url || null,
        })) || [];
      events.push(...evs);
    });

    // Supprimer les doublons par id
    const uniqueEventsMap = new Map<string, any>();
    events.forEach(ev => {
      if (!uniqueEventsMap.has(ev.id)) {
        uniqueEventsMap.set(ev.id, ev);
      }
    });

    const uniqueEvents = Array.from(uniqueEventsMap.values());

    return NextResponse.json({ events: uniqueEvents });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
