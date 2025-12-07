import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

// Liste de toutes les sources
const API_ROUTES = [
  "agenda-trad-haute-garonne",
  "cultureenmouvements",
  "demosphere",
  "hautegaronne",
  "radarsquat",
  "toulousemetropole",
  "tourismehautegaronne",
  "meetup-full",  // Meetup iCal
  "ut3-min",
  "capitole-min",
  "theatredupave",
  "discord",
];

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";
const DEFAULT_THEME_IMAGE = "/images/tourismehg31/placeholder.jpg";

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

// -------------------------
// ⚡ Cache in-memory pour Meetup
// -------------------------
const meetupCache: Record<string, { timestamp: number; data: any }> = {};
const MEETUP_CACHE_TTL = 1000 * 60 * 5; // 5 min

function normalize(str?: string) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getThemeImage(thematique?: string) {
  if (!thematique) return DEFAULT_THEME_IMAGE;
  const t = normalize(thematique.trim());
  if (t.startsWith("education")) return THEME_IMAGES["Education Emploi"];
  for (const key of Object.keys(THEME_IMAGES)) {
    if (normalize(key) === t) return THEME_IMAGES[key];
  }
  return DEFAULT_THEME_IMAGE;
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
    image = ev.image || ev.coverImage || getThemeImage(ev.thematique) || DEFAULT_THEME_IMAGE;
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

// fetch avec retry
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

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const results: { route: string; data: any }[] = [];

    // 🔹 1️⃣ Fetch Meetup directement avec cache
    const meetupRoute = "meetup-full";
    const cached = meetupCache[meetupRoute];
    const now = Date.now();
    if (cached && now - cached.timestamp < MEETUP_CACHE_TTL) {
      results.push({ route: meetupRoute, data: cached.data });
    } else {
      try {
        const data = await fetchWithRetry(`${origin}/api/${meetupRoute}`, 2, 10000);
        meetupCache[meetupRoute] = { timestamp: now, data };
        results.push({ route: meetupRoute, data });
      } catch (err) {
        console.warn(`⚠️ Meetup route ${meetupRoute} failed:`, err);
        results.push({ route: meetupRoute, data: [] });
      }
    }

    // 🔹 2️⃣ Fetch autres routes en parallèle
    const otherRoutes = API_ROUTES.filter(r => r !== meetupRoute);
    const otherResults = await Promise.all(
      otherRoutes.map(async (route) => {
        try {
          const data = await fetchWithRetry(`${origin}/api/${route}`, 2, 10000);
          return { route, data };
        } catch {
          return { route, data: [] };
        }
      })
    );

    results.push(...otherResults);

    // 🔹 3️⃣ Normalisation et agrégation
    const allEvents = results.flatMap(({ route, data }) => {
      const list = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return list.map(ev => normalizeEvent(ev, route)).filter(Boolean);
    });

    const nowDate = new Date();
    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 31);

    const filtered = allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate >= today && evDate < limitDate;
    });

    // supprimer doublons
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
