import { NextRequest, NextResponse } from "next/server";

// Liste des routes à agréger
const API_ROUTES = [
  "meetup-events",
  "meetup-expats",
  "meetup-coloc",
  "meetup-sorties",
];

// Forcer le mode dynamique pour éviter le cache statique
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1h

export async function GET(request: NextRequest) {
  // ⚠️ Assurez-vous que NEXT_PUBLIC_BASE_URL est défini dans Vercel
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ftstoulouse.vercel.app";

  try {
    // 🔹 Fetch parallèle pour toutes les routes
    const fetchPromises = API_ROUTES.map(async (route) => {
      try {
        const res = await fetch(`${BASE_URL}/api/${route}`, {
          next: { revalidate: 3600 },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      } catch (err) {
        console.error(`Erreur de fetch pour /api/${route}:`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);

    // 🔹 Agrégation et normalisation
    let events: any[] = results.flatMap((r) => {
      if (Array.isArray(r.events)) return r.events;
      if (Array.isArray(r)) return r;
      return [];
    });

    // 🔹 Correction des dates passées → aujourd’hui
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

      return { ...ev, date: d.toISOString() };
    });

    // 🔹 Supprimer doublons
    const uniqueEvents: Record<string, any> = {};
    events.forEach((ev) => {
      const rawDate = ev.date || ev.startDate || ev.start || "no-date";
      const rawTitle = ev.title || "No Title";
      const rawLocation = ev.location || ev.fullAddress || "No Location";

      const key = ev.id || `${rawTitle}-${new Date(rawDate).toISOString().split("T")[0]}-${rawLocation}`;
      if (!uniqueEvents[key]) uniqueEvents[key] = ev;
    });

    const unifiedEvents = Object.values(uniqueEvents);

    // 🔹 Tri par date croissante
    unifiedEvents.sort((a, b) => {
      const da = new Date(a.date || a.startDate || a.start).getTime();
      const db = new Date(b.date || b.startDate || b.start).getTime();
      return da - db;
    });

    // 🔹 Sérialisation finale (sécurisée)
    const serializedEvents = unifiedEvents.map((ev) => ({
      ...ev,
      date: ev.date || null,
      startDate: ev.startDate || null,
      start: ev.start || null,
    }));

    return NextResponse.json({
      total: serializedEvents.length,
      events: serializedEvents,
    });
  } catch (err: any) {
    console.error("Erreur route /api/agendatoulouse:", err);
    return NextResponse.json(
      { total: 0, events: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
