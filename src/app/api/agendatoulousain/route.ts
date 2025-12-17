// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_SOURCES = [
  "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne",
  "https://ftstoulouse.vercel.app/api/agendaculturel",
  "https://ftstoulouse.vercel.app/api/capitole-min",
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// --------------------------------------------------
// HTML / texte helpers
// --------------------------------------------------
function decodeHtmlEntities(text: string) {
  if (!text) return "";
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function cleanDescription(desc?: string) {
  if (!desc) return "";
  const withoutHtml = desc.replace(/<\/?[^>]+(>|$)/g, " ");
  return decodeHtmlEntities(withoutHtml).replace(/\s+/g, " ");
}

// Images par défaut UT Capitole
function getEventImage(title?: string, source?: string) {
  if (source?.toLowerCase().includes("capitole")) {
    if (!title) return "/images/capitole/capidefaut.jpg";
    const lower = title.toLowerCase();
    if (lower.includes("ciné") || lower.includes("cine"))
      return "/images/capitole/capicine.jpg";
    if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
    if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
    return "/images/capitole/capidefaut.jpg";
  }
  return ""; // autres sources peuvent définir leur image
}

// --------------------------------------------------
// Normalisation flux externes
// --------------------------------------------------
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

// Extraction approximative de date depuis texte (ex: "31 décembre 2025 à 01:00")
function extractDateWithTime(text?: string): Date | null {
  if (!text) return null;
  const regex = /(\d{1,2})\s+([a-zéû]+)\s+(\d{4})\s*(?:à\s*(\d{1,2}:\d{2}))?/i;
  const match = text.match(regex);
  if (!match) return null;

  const [_, day, monthName, year, time] = match;
  const months: Record<string, number> = {
    janvier: 0,
    février: 1,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    août: 7,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    décembre: 11,
    decembre: 11,
  };
  const month = months[monthName.toLowerCase()];
  if (month === undefined) return null;

  const [hour = "0", minute = "0"] = time ? time.split(":") : ["0", "0"];
  return new Date(Number(year), month, Number(day), Number(hour), Number(minute));
}

// --------------------------------------------------
// API handler
// --------------------------------------------------
export async function GET(request: NextRequest) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

    events = events.map((ev) => {
      // Date
      let d: Date | null = null;
      if (ev.date || ev.start || ev.startDate) {
        d = new Date(ev.date || ev.start || ev.startDate);
      }

      // Si date manquante ou invalide → extraire depuis description/titre
      if (!d || isNaN(d.getTime())) {
        d = extractDateWithTime(ev.description || ev.title) || new Date(today);
      }

      // Si date passée → aujourd’hui minuit
      if (d < today) d = new Date(today);

      return {
        ...ev,
        date: d.toISOString(),
        description: cleanDescription(ev.description),
        source: ev.source || ev.title || "Agenda Toulouse",
        image: getEventImage(ev.title, ev.source),
      };
    });

    // Suppression des doublons
    const uniq = new Map<string, any>();
    events.forEach((ev) => {
      const key =
        ev.id ||
        `${ev.title || "no-title"}-${ev.date || "no-date"}-${ev.source || "no-source"}`;
      if (!uniq.has(key)) uniq.set(key, ev);
    });

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
