// src/app/api/agendatoulouse/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getEvents as getOpenDataEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// -------------------------
// Constantes locales
// -------------------------
const PLACEHOLDER_IMAGE = "/images/placeholders.jpg";

const THEME_IMAGES: Record<string, string> = {
  "Culture": "/images/tourismehg31/themeculture.jpg",
  "Education Emploi": "/images/tourismehg31/themeeducation.jpg",
  "Autres": "/images/tourismehg31/themeautres.jpg",
  "Sport": "/images/tourismehg31/themesport.jpg",
  "Environnement": "/images/tourismehg31/themeenvironnement.jpg",
  "Économie / vie des entreprises": "/images/tourismehg31/themeentreprises.jpg",
  "Vides Grenier / Brocantes / Foires et salons": "/images/tourismehg31/themebrocantes.jpg",
  "Culture scientifique": "/images/tourismehg31/themesciences.jpg",
  "Agritourisme": "/images/tourismehg31/themeagritourisme.jpg",
};

const API_ROUTES = [
  "agenda-trad-haute-garonne",
  "agendaculturel",
  "cultureenmouvements",
  "demosphere",
  "hautegaronne",
  "radarsquat",
  "toulousemetropole",
  "tourismehautegaronne",
  "ut3-min",
  "capitole-min",
  "theatredupave",
  "discord",
];

// -------------------------
// Cache interne Meetup
// -------------------------
const meetupCache: { timestamp: number; data: any[] } = { timestamp: 0, data: [] };
const MEETUP_CACHE_TTL = 1000 * 60 * 5;

async function fetchMeetup(origin: string): Promise<any[]> {
  const now = Date.now();
  if (now - meetupCache.timestamp < MEETUP_CACHE_TTL) return meetupCache.data;

  try {
    const res = await fetch(`${origin}/api/meetup-full`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const events = Array.isArray(json.events) ? json.events : [];
    meetupCache.timestamp = now;
    meetupCache.data = events;
    return events;
  } catch (err) {
    console.warn("⚠️ Meetup fetch failed:", err);
    return [];
  }
}

// -------------------------
// Normalisation
// -------------------------
function normalize(str?: string) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getThemeImage(thematique?: string) {
  if (!thematique) return PLACEHOLDER_IMAGE;
  const t = normalize(thematique.trim());
  if (t.startsWith("education")) return THEME_IMAGES["Education Emploi"];
  for (const key of Object.keys(THEME_IMAGES)) {
    if (normalize(key) === t) return THEME_IMAGES[key];
  }
  return PLACEHOLDER_IMAGE;
}

function normalizeEvent(ev: any, sourceName: string) {
  if (!ev) return null;

  const rawDate =
    ev.date || ev.start || ev.startDate || ev.date_debut || ev.dateDebut || ev.pubDate || null;

  const dateObj = rawDate ? new Date(rawDate) : null;
  if (!dateObj || isNaN(dateObj.getTime())) return null;

  const dateISO = dateObj.toISOString();
  const dateFormatted = dateObj.toLocaleString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullAddress =
    ev.fullAddress || ev.location || ev.commune || ev.lieu_nom || ev.adresse || "";
  const location = ev.location || ev.commune || ev.lieu_nom || ev.ville || "";

  let image;

  if (sourceName === "tourismehautegaronne") {
    image = ev.image || ev.coverImage || getThemeImage(ev.thematique);
  } else if (sourceName === "demosphere") {
    image = ev.image || "/logo/demosphereoriginal.png";
  } else if (["ut3-min", "capitole-min"].includes(sourceName)) {
    const titleLower = (ev.title || "").toLowerCase();
    if (titleLower.includes("ciné") || titleLower.includes("cine"))
      image = "/images/capitole/capicine.jpg";
    else if (titleLower.includes("conf"))
      image = "/images/capitole/capiconf.jpg";
    else if (titleLower.includes("expo"))
      image = "/images/capitole/capiexpo.jpg";
    else image = "/images/capitole/capidefaut.jpg";
  } else {
    image = ev.image || ev.coverImage || PLACEHOLDER_IMAGE;
  }

  return {
    id: ev.id || `${ev.title}-${dateISO}`,
    title: ev.title || "Événement",
    description: ev.description || "",
    date: dateISO,
    dateFormatted,
    location,
    fullAddress,
    image,
    url: ev.url || ev.link || "",
    source: sourceName,
  };
}

// -------------------------
// Fetch avec retry
// -------------------------
async function fetchWithRetry(url: string, retries = 2, timeout = 8000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// -------------------------
// GET principal
// -------------------------
export async function GET(request: NextRequest) {
  let origin = request.nextUrl.origin;

  // 🔥 Correction automatique en localhost & vercel
  if (origin.includes("localhost")) {
    origin = "http://localhost:9002";
  }

  try {
    const results: { route: string; data: any }[] = [];

    // Meetup
    const meetupEvents = await fetchMeetup(origin);
    results.push({ route: "meetup-full", data: { events: meetupEvents } });

    // Autres routes
    const otherResults = await Promise.all(
      API_ROUTES.map(async (route) => {
        try {
          const data = await fetchWithRetry(`${origin}/api/${route}`, 2, 10000);
          return { route, data };
        } catch {
          return { route, data: [] };
        }
      })
    );

    results.push(...otherResults);

    // OpenData
    const openDataEvents = await getOpenDataEvents();
    results.push({ route: "opendata", data: openDataEvents });

    // Normalisation
    const allEvents = results.flatMap(({ route, data }) => {
      const list =
        Array.isArray(data.events)
          ? data.events
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];

      return list.map((ev) => normalizeEvent(ev, route)).filter(Boolean);
    });

    // Filtrage 31 jours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(today.getDate() + 31);

    const filtered = allEvents.filter((e) => {
      const d = new Date(e.date);
      return d >= today && d <= limit;
    });

    // Déduplication
    const uniq = new Map();
    filtered.forEach((ev) => uniq.set(`${ev.title}-${ev.date}`, ev));

    // Tri final
    const finalEvents = [...uniq.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ total: finalEvents.length, events: finalEvents });
  } catch (err: any) {
    console.error("Erreur agendatoulouse:", err);
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'agrégation" },
      { status: 500 }
    );
  }
}
