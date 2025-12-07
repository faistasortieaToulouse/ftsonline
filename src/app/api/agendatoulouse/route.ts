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
// Cache Meetup
// -------------------------
const meetupCache = { timestamp: 0, data: [] as any[] };
const MEETUP_CACHE_TTL = 1000 * 60 * 5;

// 🔥 Fallback Meetup minimal en cas de 401
function meetupFallback() {
  return [];
}

async function fetchMeetup(origin: string): Promise<any[]> {
  const now = Date.now();
  if (now - meetupCache.timestamp < MEETUP_CACHE_TTL) return meetupCache.data;

  try {
    const res = await fetch(`${origin}/api/meetup-full`);

    if (!res.ok) {
      console.warn("⚠️ Meetup fetch failed:", res.status);
      return meetupFallback();
    }

    const json = await res.json();
    const events = Array.isArray(json.events) ? json.events : [];

    meetupCache.timestamp = now;
    meetupCache.data = events;

    return events;
  } catch (err) {
    console.warn("⚠️ Meetup fetch crashed:", err);
    return meetupFallback();
  }
}

// -------------------------
// Outils normalisation
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
    ev.date ||
    ev.start ||
    ev.startDate ||
    ev.date_debut ||
    ev.dateDebut ||
    ev.pubDate ||
    null;

  const d = rawDate ? new Date(rawDate) : null;
  if (!d || isNaN(d.getTime())) return null;

  const dateISO = d.toISOString();

  const dateFormatted = d.toLocaleString("fr-FR", {
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

  let image = PLACEHOLDER_IMAGE;

  switch (sourceName) {
    case "tourismehautegaronne":
      image = ev.image || ev.coverImage || getThemeImage(ev.thematique);
      break;

    case "demosphere":
      image = ev.image || "/logo/demosphereoriginal.png";
      break;

    case "ut3-min":
    case "capitole-min": {
      const t = (ev.title || "").toLowerCase();
      if (t.includes("ciné") || t.includes("cine")) image = "/images/capitole/capicine.jpg";
      else if (t.includes("conf")) image = "/images/capitole/capiconf.jpg";
      else if (t.includes("expo")) image = "/images/capitole/capiexpo.jpg";
      else image = "/images/capitole/capidefaut.jpg";
      break;
    }
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
// Retry universel
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
  const previewOrigin = request.nextUrl.origin;

  // 🔥 Détection de preview Vercel
  const isPreview = previewOrigin.includes("vercel.app") &&
                    !previewOrigin.includes("ftstoulouse.vercel.app");

  let origin = previewOrigin;

  if (previewOrigin.includes("localhost")) {
    origin = "http://localhost:9002";
  } else if (isPreview) {
    origin = process.env.NEXT_PUBLIC_BASE_URL || "https://ftstoulouse.vercel.app";
  }

  console.log("🌐 Origin utilisé pour les routes internes:", origin);

  // -------------------------
  // Pipelines
  // -------------------------
  try {
    const results: { route: string; data: any }[] = [];

    // 1. Meetup
    const meetupEvents = await fetchMeetup(origin);
    results.push({ route: "meetup-full", data: { events: meetupEvents } });

    // 2. Autres routes
    const otherResults = await Promise.all(
      API_ROUTES.map(async (route) => {
        try {
          const data = await fetchWithRetry(`${origin}/api/${route}`, 2, 10000);
          return { route, data };
        } catch {
          console.warn(`⚠️ Route ${route} indisponible`);
          return { route, data: [] };
        }
      })
    );

    results.push(...otherResults);

    // 3. OpenData Fallback
    const openData = await getOpenDataEvents();
    results.push({ route: "opendata", data: openData });

    // 4. Agrégation + normalisation
    const allEvents = results.flatMap(({ route, data }) => {
      const list =
        Array.isArray(data.events)
          ? data.events
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];

      return list.map((e) => normalizeEvent(e, route)).filter(Boolean);
    });

    // 5. Fenêtre 31 jours
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 31);

    const filtered = allEvents.filter((ev) => {
      const d = new Date(ev.date);
      return d >= today && d <= limit;
    });

    // 6. Déduplication
    const uniq = new Map();
    filtered.forEach((ev) => uniq.set(`${ev.title}-${ev.date}`, ev));

    // 7. Tri final
    const finalEvents = [...uniq.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      total: finalEvents.length,
      events: finalEvents,
    });
  } catch (err: any) {
    console.error("🔥 Erreur agendatoulouse:", err);
    return NextResponse.json(
      { error: err.message || "Erreur interne" },
      { status: 500 }
    );
  }
}
