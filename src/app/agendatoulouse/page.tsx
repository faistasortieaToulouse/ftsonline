import { NextRequest, NextResponse } from "next/server";

// Liste de TOUTES les routes API à agréger
const API_ROUTES = [
  "meetup-events",
  "meetup-expats",
  "meetup-coloc",
  "meetup-sorties",
];

// Meetup renvoie parfois du HTML → route dynamique
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1h

export async function GET(request: NextRequest) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://ftstoulouse.vercel.app";

  const fetchPromises = API_ROUTES.map(async (route) => {
    try {
      const res = await fetch(`${BASE_URL}/api/${route}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        console.error(`Erreur ${res.status} sur /api/${route}`);
        return [];
      }

      const data = await res.json();
      // On normalise : certains endpoints renvoient { events: [...] }, d'autres directement un tableau
      if (Array.isArray(data.events)) return data.events;
      if (Array.isArray(data)) return data;
      return [];
    } catch (err: any) {
      console.error(`Erreur de fetch pour /api/${route}:`, err.message || err);
      return [];
    }
  });

  try {
    const results = await Promise.all(fetchPromises);
    console.log("Résultats bruts des API internes :", results);

    // Agrégation et normalisation
    let events: any[] = results.flat();

    // Correction des dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    events = events.map((ev) => {
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

      return ev;
    });

    // Supprimer doublons
    const uniqueMap = new Map<string, any>();
    events.forEach((ev) => {
      const rawDate = ev.date || ev.startDate || ev.start;
      const rawTitle = ev.title || "No Title";
      const rawLocation = ev.location || ev.fullAddress || "No Location";

      const key =
        ev.id ||
        `${rawTitle}-${new Date(rawDate).toISOString().split("T")[0]}-${rawLocation}`;

      if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
    });

    // Trier par date croissante
    const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
      const da = new Date(a.date || a.startDate || a.start);
      const db = new Date(b.date || b.startDate || b.start);
      return da.getTime() - db.getTime();
    });

    console.log("Nombre total d'événements :", unifiedEvents.length);

    return NextResponse.json({ total: unifiedEvents.length, events: unifiedEvents });
  } catch (err: any) {
    console.error("Erreur lors de l'agrégation :", err.message || err);
    return NextResponse.json(
      { total: 0, events: [], error: err.message || "Erreur interne" },
      { status: 500 }
    );
  }
}
