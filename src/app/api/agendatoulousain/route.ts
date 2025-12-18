// src/app/api/agendatoulousain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { decode } from "he";

// 🔹 UT-Capitole : images par défaut
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// 🔹 Normalisation générique des flux externes
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.records)) return data.records;
  const firstArray = Object.values(data).find(v => Array.isArray(v));
  return Array.isArray(firstArray) ? firstArray : [];
}

// 🎬 Normalisation spécifique TMDB (cinéma)
function normalizeCinema(data: any): any[] {
  if (!data?.results) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data.results
    .filter((film: any) => {
      if (!film.release_date) return false;
      const d = new Date(film.release_date);
      return !isNaN(d.getTime()) && d >= today;
    })
    .map((film: any) => ({
      id: `tmdb-${film.id}`,
      title: film.title,
      date: film.release_date,
      description: film.overview || "Sortie cinéma",
      image: film.poster_path
        ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
        : "/images/cinema-default.jpg",
      source: "Sorties cinéma themoviedb",
      link: `https://www.themoviedb.org/movie/${film.id}?language=fr-FR`,
    }));
}

// 🔹 Parse ICS COMDT
function parseICS(text: string) {
  const events: any[] = [];
  const blocks = text.split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}[^:]*:(.+)`));
      return m ? m[1].trim() : "";
    };

    const dt = get("DTSTART");
    if (!dt) continue;
    const date = /^\d{8}$/.test(dt)
      ? new Date(`${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T00:00:00`)
      : new Date(dt);
    if (isNaN(date.getTime())) continue;

    events.push({
      id: get("UID"),
      title: get("SUMMARY"),
      description: get("DESCRIPTION").replace(/\\n/g, "\n"),
      link: get("URL"),
      location: get("LOCATION"),
      date: date.toISOString(),
      source: "COMDT",
    });
  }

  return events;
}

// 🎵 Normalisation COMDT pour today + 31 jours
function normalizeComdtICS(events: any[]): any[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 31);

  return events
    .map(ev => {
      const d = new Date(ev.date);
      if (!d || isNaN(d.getTime()) || d < today || d > maxDate) return null;
      return { ...ev, date: d.toISOString() };
    })
    .filter(Boolean);
}

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;

    // 🔹 Sources locales côté serveur
    const EXTERNAL_SOURCES = [
      { url: `${origin}/api/agenda-trad-haute-garonne`, defaultSource: "Agenda Trad Haute-Garonne" },
      { url: `${origin}/api/agendaculturel`, defaultSource: "Agenda Culturel" },
      { url: `${origin}/api/capitole-min`, defaultSource: "Université Toulouse Capitole" },
      { url: `${origin}/api/cinematoulouse`, defaultSource: "Sorties cinéma" },
      { url: "COMDT", defaultSource: "COMDT" }, // signal spécial pour ICS
    ];

    const results = await Promise.all(
      EXTERNAL_SOURCES.map(async ({ url, defaultSource }) => {
        try {
          if (defaultSource === "Sorties cinéma") {
            const res = await fetch(`${origin}/api/cinematoulouse`, { cache: "no-store" });
            const json = await res.json();
            return normalizeCinema(json);
          }

          if (defaultSource === "COMDT") {
            const res = await fetch("https://www.comdt.org/events/feed/?ical=1", {
              headers: { Accept: "text/calendar" },
              cache: "no-store",
            });
            if (!res.ok) return [];
            const text = await res.text();
            const events = parseICS(text);
            return normalizeComdtICS(events);
          }

          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();

          const data = normalizeApiResult(json);
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

    // 🔹 Normalisation des dates + nettoyage description
    events = events.map(ev => {
      let raw = ev.date || ev.start || ev.startDate;
      let d: Date | null = raw ? new Date(raw) : null;

      if (!d || isNaN(d.getTime()) || d < now) {
        d = new Date(now);
      }

      let description = ev.description ? decode(ev.description) : "";

      if (ev.source === "Agenda Trad Haute-Garonne") {
        description = description.replace(/source:.*AgendaTrad.*$/i, "").trim();
      }

      description = description
        .replace(/<(?!\/?(p|br|strong|em|a)\b)[^>]*>/gi, "")
        .trim();

      return {
        ...ev,
        date: d.toISOString(),
        description,
      };
    });

    // 🔹 Images UT Capitole
    events = events.map(ev => {
      if (ev.source?.toLowerCase().includes("capitole") && !ev.image) {
        return { ...ev, image: getCapitoleImage(ev.title) };
      }
      return ev;
    });

    // 🔹 Dédoublonnage
    const uniq = new Map<string, any>();
    events.forEach(ev => {
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
