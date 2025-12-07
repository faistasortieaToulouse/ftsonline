// src/app/api/agendatoulouse/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getEvents as getOpenDataEvents } from "@/lib/events"; // OpenData + RSS + fallback

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

// Routes supplémentaires pour agrégation
const API_ROUTES = [
  "agenda-trad-haute-garonne",
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
// ⚡ Cache interne Meetup
// -------------------------
const meetupCache: { timestamp: number; data: any[] } = { timestamp: 0, data: [] };
const MEETUP_CACHE_TTL = 1000 * 60 * 5; // 5 min

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

  const rawDate = ev.date || ev.start || ev.startDate || ev.date_debut || ev.dateDebut || null;
  const dateObj = rawDate ? new Date(rawDate) : null;
  if (!dateObj || isNaN(dateObj.getTime())) return null;

  const dateISO = dateObj.toISOString();
  const dateFormatted = dateObj.toLocaleString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const fullAddress = ev.fullAddress || ev.location || ev.commune || ev.lieu_nom || ev.adresse || "";
  const location = ev.location || ev.commune || ev.lieu_nom || ev.ville || "";

  let image;
  if (sourceName === "tourismehautegaronne") {
    image = ev.image || ev.coverImage || getThemeImage(ev.thematique) || PLACEHOLDER_IMAGE;
  } else if (sourceName === "demosphere") {
    image = ev.image || ev.coverImage || "/logo/demosphereoriginal.png";
  } else if (sourceName === "ut3-min" || sourceName === "capitole-min") {
    const titleLower = (ev.title || "").toLowerCase();
    if (titleLower.includes("ciné") || titleLower.includes("cine")) image = "/images/capitole/capicine.jpg";
    else if (titleLower.includes("conf")) image = "/images/capitole/capiconf.jpg";
    else if (titleLower.includes("expo")) image = "/images/capitole/capiexpo.jpg";
    else image = "/images/capitole/capidefaut.jpg";
  } else if (sourceName === "meetup-full") {
    image = ev.image || PLACEHOLDER_IMAGE;
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
    source: ev.source || sourceName,
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
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

// -------------------------
// Endpoint principal
// -------------------------
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const results: { route: string; data: any }[] = [];

    // 1️⃣ Meetup
    const meetupEvents = await fetchMeetup(origin);
    results.push({ route: "meetup-full", data: { events: meetupEvents } });

    // 2️⃣ Autres routes
    const otherResults = await Promise.all(
      API_ROUTES.map(async (route) => {
        if (route === "meetup-full") return null;
        try {
          const data = await fetchWithRetry(`${origin}/api/${route}`, 2, 10000);
          return { route, data };
        } catch {
          return { route, data: [] };
        }
      })
    );
    results.push(...otherResults.filter(Boolean) as any);

    // 3️⃣ OpenData / RSS fallback
    const openDataEvents = await getOpenDataEvents();
    results.push({ route: "opendata", data: openDataEvents });

    // 4️⃣ Normalisation & agrégation
    const allEvents = results.flatMap(({ route, data }) => {
      const list = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return list.map(ev => normalizeEvent(ev, route)).filter(Boolean);
    });

    // 5️⃣ Filtrage next 31 jours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 31);

    const filtered = allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate >= today && evDate <= limitDate;
    });

    // 6️⃣ Déduplication
    const uniqMap = new Map<string, any>();
    filtered.forEach(ev => {
      const key = `${ev.title}-${ev.date}`;
      if (!uniqMap.has(key)) uniqMap.set(key, ev);
    });

    const finalEvents = Array.from(uniqMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ total: finalEvents.length, events: finalEvents });
  } catch (err: any) {
    console.error("Erreur agendatoulouse:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'agrégation" }, { status: 500 });
  }
}
