// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

// 🔹 Sources externes (hors UT Capitole, avec source par défaut)
const EXTERNAL_SOURCES = [
  { url: "https://ftstoulouse.vercel.app/api/agenda-trad-haute-garonne", defaultSource: "Agenda Trad Haute-Garonne" },
  { url: "https://ftstoulouse.vercel.app/api/agendaculturel", defaultSource: "Agenda Culturel" },
];

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// 🔹 Fonctions utilitaires pour images UT Capitole
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// 🔹 Nettoyer description HTML basique
const cleanDescription = (desc?: string) => desc ? desc.replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

// 🔹 Normalisation résultats API
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

// 🔹 Récupération UT Capitole
async function fetchCapitoleEvents() {
  const rssUrl =
    "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";

  try {
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/rss+xml" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    const parser = new Parser();
    const feed = await parser.parseString(xml);

    return (feed.items || []).map(item => {
      const start = item.pubDate ? new Date(item.pubDate) : new Date();
      return {
        id: item.guid || item.link || item.title,
        title: item.title,
        description: item.contentSnippet || "Événement ouvert à tous",
        url: item.link,
        image: getCapitoleImage(item.title),
        date: start.toISOString(),
        source: "Université Toulouse Capitole",
      };
    });
  } catch (err) {
    console.error("Flux UT Capitole inaccessible :", err);
    return [];
  }
}

// 🔹 Route GET
export async function GET(request: NextRequest) {
  try {
    // 🔹 Récupérer les événements UT Capitole
    const capitoleEvents = await fetchCapitoleEvents();

    // 🔹 Récupérer les autres sources
    const otherResults = await Promise.all(
      EXTERNAL_SOURCES.map(async ({ url, defaultSource }) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const data = normalizeApiResult(json);
          return data.map(ev => ({
            ...ev,
            source: ev.source || defaultSource,
            description: cleanDescription(ev.description),
          }));
        } catch (err) {
          console.error("Erreur API externe:", url, err);
          return [];
        }
      })
    );

    // 🔹 Fusionner toutes les sources
    let events = [...capitoleEvents, ...otherResults.flat()];

    // 🔹 Normaliser dates et mettre aujourd'hui si manquante ou passée
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    events = events.map(ev => {
      let raw = ev.date || ev.start || ev.startDate;
      let d: Date | null = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime()) || d < now) d = new Date(now);
      return { ...ev, date: d.toISOString() };
    });

    // 🔹 Supprimer doublons
    const uniq = new Map<string, any>();
    events.forEach(ev => {
      const key = ev.id || `${ev.title || "no-title"}-${ev.date || "no-date"}-${ev.source || "no-source"}`;
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
    return NextResponse.json({ total: 0, events: [], error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
