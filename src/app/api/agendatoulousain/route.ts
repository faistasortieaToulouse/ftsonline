import { NextRequest, NextResponse } from "next/server";

// Liste de toutes les routes API internes à agréger
const API_ROUTES = [
  "meetup-events",
  "meetup-expats",
  "meetup-coloc",
  "meetup-sorties",
];

// Liste des sources externes à agréger (ancien agendatoulousain)
const EXTERNAL_SOURCES = [
  "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne",
  "https://ftstoulouse.vercel.app/api/agendaculturel",
  // tu peux ajouter d’autres URLs ici
];

// Forcer le mode dynamique (Meetup renvoie du HTML ou bloque)
export const dynamic = "force-dynamic";
export const revalidate = 3600;

function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;

  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return firstArray || [];
}

export async function GET(request: NextRequest) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin || "http://localhost:3000";

  try {
    // 🔹 1. Fetch interne Meetup
    const meetupPromises = API_ROUTES.map(async (route) => {
      try {
        const res = await fetch(`${BASE_URL}/api/${route}`, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      } catch (err) {
        console.error(`Erreur de fetch pour /api/${route}:`, err);
        return [];
      }
    });

    // 🔹 2. Fetch sources externes
    const externalPromises = EXTERNAL_SOURCES.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        return normalizeApiResult(json);
      } catch (err) {
        console.error("Erreur API externe:", url, err);
        return [];
      }
    });

    // 🔹 3. Attendre toutes les promesses
    const meetupResults = await Promise.all(meetupPromises);
    const externalResults = await Promise.all(externalPromises);

    // 🔹 4. Fusionner toutes les sources
    let events: any[] = [
      ...meetupResults.flatMap(r => Array.isArray(r.events) ? r.events : Array.isArray(r) ? r : []),
      ...externalResults.flat(),
    ];

    // 🔹 5. Correction dates passées → aujourd’hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    events = events.map(ev => {
      const raw = ev.date || ev.startDate || ev.start;
      const d = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime())) return ev;

      if (d < today) {
        const corrected = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          d.getHours(),
          d.getMinutes(),
          d.getSeconds()
        );
        return { ...ev, date: corrected.toISOString() };
      }
      return { ...ev, date: d.toISOString() };
    });

    // 🔹 6. Supprimer doublons
    const uniqueMap = new Map<string, any>();
    events.forEach(ev => {
      const rawDate = ev.date || ev.startDate || ev.start || "no-date";
      const rawTitle = ev.title || "No Title";
      const rawLocation = ev.location || ev.fullAddress || "No Location";
      const key = ev.id || `${rawTitle}-${new Date(rawDate).toISOString().split("T")[0]}-${rawLocation}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
    });

    // 🔹 7. Trier par date croissante
    const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
      const da = new Date(a.date || a.startDate || a.start).getTime();
      const db = new Date(b.date || b.startDate || b.start).getTime();
      return da - db;
    });

    // 🔹 8. Sérialisation JSON sécurisée
    const serializedEvents = JSON.parse(JSON.stringify(unifiedEvents));

    return NextResponse.json({ events: serializedEvents });
  } catch (err: any) {
    console.error("Erreur route /api/meetup-full:", err);
    return NextResponse.json(
      { events: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
