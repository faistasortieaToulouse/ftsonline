// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";

// 🔹 Sources externes agrégées
const EXTERNAL_SOURCES = [
  "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne",
  "https://ftstoulouse.vercel.app/api/agendaculturel",
  "https://ftstoulouse.vercel.app/api/capitole-min", // UT Capitole
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// 🔹 Fonctions utilitaires pour les images UT Capitole
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// 🔹 Normalisation des résultats
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

// 🔹 Route GET
export async function GET(request: NextRequest) {
  try {
    const results = await Promise.all(
      EXTERNAL_SOURCES.map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          return normalizeApiResult(json);
        } catch (err) {
          console.error("Erreur API externe:", url, err);
          return [];
        }
      })
    );

    let events = results.flat();

    // 🔹 Normalisation des dates
    events = events.map((ev) => {
      const raw = ev.date || ev.start || ev.startDate;
      const d = raw ? new Date(raw) : null;
      return {
        ...ev,
        date: d && !isNaN(d.getTime()) ? d.toISOString() : null,
      };
    });

    // 🔹 Ajouter les images pour UT Capitole si pas déjà présentes
    events = events.map((ev) => {
      if (ev.source?.toLowerCase().includes("capitole") && !ev.image) {
        return { ...ev, image: getCapitoleImage(ev.title) };
      }
      return ev;
    });

    // 🔹 Suppression des doublons
    const uniq = new Map<string, any>();
    events.forEach((ev) => {
      const key =
        ev.id ||
        `${ev.title || "no-title"}-${ev.date || "no-date"}-${ev.source || "no-source"}`;
      if (!uniq.has(key)) uniq.set(key, ev);
    });

    // 🔹 Tri chronologique
    const sorted = Array.from(uniq.values()).sort(
      (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
    );

    return NextResponse.json({
      total: sorted.length,
      events: sorted,
    });
  } catch (err: any) {
    console.error("Erreur /api/agendatoulousain:", err);
    return NextResponse.json(
      { total: 0, events: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
