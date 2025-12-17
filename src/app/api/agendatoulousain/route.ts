// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";

// 🔹 Fonctions utilitaires pour les images UT Capitole
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// 🔹 Normalisation des résultats API
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

// 🔹 Nettoyer HTML léger (supprime les balises <script> / <style>)
function cleanDescription(desc?: string) {
  if (!desc) return "";
  return desc.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
             .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
             .trim();
}

// 🔹 Route GET
export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin; // localhost ou prod
    const EXTERNAL_SOURCES = [
      { url: `${baseUrl}/api/agenda-trad-haute-garonne`, defaultSource: "Agenda Trad Haute-Garonne" },
      { url: `${baseUrl}/api/agendaculturel`, defaultSource: "Agenda Culturel" },
      { url: `${baseUrl}/api/capitole-min`, defaultSource: "Université Toulouse Capitole" },
    ];

    // 🔹 Récupération de toutes les sources
    const results = await Promise.all(
      EXTERNAL_SOURCES.map(async ({ url, defaultSource }) => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const data = normalizeApiResult(json);

          // Ajouter la source par défaut si manquante
          return data.map(ev => ({ ...ev, source: ev.source || defaultSource }));
        } catch (err) {
          console.error("Erreur API externe:", url, err);
          return [];
        }
      })
    );

    let events = results.flat();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 🔹 Normalisation des dates + date du jour si manquante ou passée
    events = events.map(ev => {
      let raw = ev.date || ev.start || ev.startDate;
      let d: Date | null = raw ? new Date(raw) : null;

      if (!d || isNaN(d.getTime()) || d < now) {
        d = new Date(now);
      }

      return {
        ...ev,
        date: d.toISOString(),
        description: cleanDescription(ev.description),
      };
    });

    // 🔹 Ajouter image UT Capitole si nécessaire
    events = events.map(ev => {
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

    return NextResponse.json({ total: sorted.length, events: sorted });
  } catch (err: any) {
    console.error("Erreur /api/agendatoulousain:", err);
    return NextResponse.json(
      { total: 0, events: [], error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
