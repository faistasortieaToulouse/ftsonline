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

// 🔹 Cartographie catégorie → image par défaut COMDT
const defaultComdtImages: Record<string, string> = {
  "Stages": "/images/comdt/catecomdtstage.jpg",
  "Stages de danse": "/images/comdt/catecomdtdanse.jpg",
  "Stages de musique": "/images/comdt/catecomdtmusique.jpg",
  "Saison du COMDT": "/images/comdt/catecomdtcomdt.jpg",
  "Evénements partenaires": "/images/comdt/catecomdtpartenaire.jpg",
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

// 🎬 Normalisation spécifique cinéma (TMDB)
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
      source: "Sorties cinéma",
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

    let date: Date | null = null;
    if (/^\d{8}$/.test(dt)) {
      date = new Date(`${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T00:00:00`);
    } else {
      const d = new Date(dt);
      if (!isNaN(d.getTime())) date = d;
    }
    if (!date) continue;

    let image = get("ATTACH");
    if (!image) {
      const categories = get("CATEGORIES").split(",").map(c => c.trim());
      for (const cat of categories) {
        if (defaultComdtImages[cat]) {
          image = defaultComdtImages[cat];
          break;
        }
      }
    }

    events.push({
      id: get("UID"),
      title: get("SUMMARY"),
      description: get("DESCRIPTION").replace(/\\n/g, "\n"),
      link: get("URL"),
      location: get("LOCATION"),
      date: date.toISOString(),
      source: "COMDT",
      categories: get("CATEGORIES").split(",").map(c => c.trim()),
      image,
    });
  }

  return events;
}

// 🎵 Normalisation COMDT → today + 31 jours
function normalizeComdtICS(events: any[]): any[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 31);

  return events.filter(ev => {
    const d = new Date(ev.date);
    return !isNaN(d.getTime()) && d >= today && d <= maxDate;
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;

    // 🔹 Sources agrégées
    const EXTERNAL_SOURCES = [
      { url: `${origin}/api/agenda-trad-haute-garonne`, source: "Agenda Trad Haute-Garonne" },
      { url: `${origin}/api/agendaculturel`, source: "Agenda Culturel" },
      { url: `${origin}/api/capitole-min`, source: "Université Toulouse Capitole" },
      { url: `${origin}/api/cinematoulouse`, source: "Sorties cinéma" },
      { url: `${origin}/api/cultureenmouvements`, source: "Culture en Mouvements" },
      { url: `${origin}/api/demosphere`, source: "Demosphere" },
      { url: `${origin}/api/discord`, source: "Discord" }, // ✅ AJOUT
      { url: "COMDT", source: "COMDT" },
    ];

    const results = await Promise.all(
      EXTERNAL_SOURCES.map(async ({ url, source }) => {
        try {
          if (source === "Sorties cinéma") {
            const res = await fetch(`${origin}/api/cinematoulouse`, { cache: "no-store" });
            return normalizeCinema(await res.json());
          }

          if (source === "COMDT") {
            const res = await fetch("https://www.comdt.org/events/feed/?ical=1", {
              headers: { Accept: "text/calendar" },
              cache: "no-store",
            });
            if (!res.ok) return [];
            return normalizeComdtICS(parseICS(await res.text()));
          }

          if (source === "Culture en Mouvements") {
            const res = await fetch(url, { cache: "no-store" });
            const json = await res.json();
            return json.map((ev: any) => ({
              ...ev,
              date: ev.start,
              source,
              categories: ["Culture en Mouvements"],
            }));
          }

          if (source === "Demosphere") {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return [];

            const json = await res.json();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 31);

            return json
              .map((ev: any) => {
                const d = new Date(ev.start);
                if (isNaN(d.getTime()) || d < today || d > maxDate) return null;

                return {
                  id: ev.id,
                  title: ev.title,
                  date: d.toISOString(),
                  description: ev.description,
                  location: ev.location,
                  link: ev.url,
                  source,
                  categories: ["Demosphere"],
                  image: "/logo/demosphereoriginal.png",
                };
              })
              .filter(Boolean);
          }

          // 🟣 DISCORD
          if (source === "Discord") {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return [];

            const json = await res.json();
            const events = json?.events || [];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 31);

            return events
              .map((ev: any) => {
                const d = new Date(ev.date);
                if (isNaN(d.getTime()) || d < today || d > maxDate) return null;

                return {
                  id: `discord-${ev.id}`,
                  title: ev.title,
                  date: d.toISOString(),
                  description: ev.description,
                  location: ev.location || "Discord",
                  link: ev.url,
                  source,
                  categories: ["Discord"],
                  image: ev.image || "/logo/discord.png",
                };
              })
              .filter(Boolean);
          }

          const res = await fetch(url, { cache: "no-store" });
          const json = await res.json();
          return normalizeApiResult(json).map(ev => ({ ...ev, source }));
        } catch {
          return [];
        }
      })
    );

    let events = results.flat();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 🔹 Normalisation finale
    events = events.map(ev => {
      let d = new Date(ev.date || ev.start);
      if (isNaN(d.getTime()) || d < now) d = now;

      let description = ev.description ? decode(ev.description) : "";
      description = description.replace(/<(?!\/?(p|br|strong|em|a)\b)[^>]*>/gi, "").trim();

      if (ev.source?.toLowerCase().includes("capitole") && !ev.image) {
        ev.image = getCapitoleImage(ev.title);
      }

      return { ...ev, date: d.toISOString(), description };
    });

    // 🔹 Dédoublonnage
    const uniq = new Map<string, any>();
    events.forEach(ev => {
      const key = ev.id || `${ev.title}-${ev.date}-${ev.source}`;
      if (!uniq.has(key)) uniq.set(key, ev);
    });

    const sorted = Array.from(uniq.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ total: sorted.length, events: sorted });
  } catch (err: any) {
    return NextResponse.json({ total: 0, events: [], error: err.message }, { status: 500 });
  }
}
