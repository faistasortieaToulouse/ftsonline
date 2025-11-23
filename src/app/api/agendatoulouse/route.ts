import { NextRequest, NextResponse } from "next/server";

const API_ROUTES = [
  "agenda-trad",
  "cultureenmouvements",
  "demosphere",
  "hautegaronne",
  "radarsquat",
  "toulousemetropole",
  "tourismehautegaronne",
  "meetup-events",
];

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin; // récupère http://localhost:9002 en local ou https://ton-site.vercel.app
  const fetchPromises = API_ROUTES.map(route =>
    fetch(`${origin}/api/${route}`).then(res => res.json()).catch(() => [])
  );

  try {
    const results = await Promise.all(fetchPromises);

    // Normaliser les événements de chaque source en tableau
    const events: any[] = results.flatMap(r => {
      if (Array.isArray(r.events)) return r.events;
      if (Array.isArray(r)) return r; // certains flux retournent directement un tableau
      return [];
    });

    // Supprimer doublons par id (si possible) ou title+date+location
    const uniqueMap = new Map<string, any>();
    events.forEach(ev => {
      const key = ev.id || `${ev.title}-${ev.date || ev.start}-${ev.location || ev.fullAddress}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
    });

    // Trier par date croissante
    const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
      const da = new Date(a.date || a.start);
      const db = new Date(b.date || b.start);
      return da.getTime() - db.getTime();
    });

    return NextResponse.json({ events: unifiedEvents });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erreur lors de l'agrégation" }, { status: 500 });
  }
}
