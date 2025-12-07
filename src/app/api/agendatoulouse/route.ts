import { NextRequest, NextResponse } from "next/server";
import { getEvents as getOpenDataEvents } from "@/lib/events";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

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

const MEETUP_ROUTES = ["meetup-events", "meetup-expats", "meetup-coloc", "meetup-sorties"];

const meetupCache = { timestamp: 0, data: [] as any[] };
const MEETUP_CACHE_TTL = 1000 * 60 * 5;

// -------------------------
// Générateur de clé unique
// -------------------------
function getUniqueKey(ev: any) {
  if (ev.id) return ev.id;
  const str = `${ev.title}-${ev.date}-${ev.location}-${ev.source}`;
  return Buffer.from(str).toString("base64"); // hash simple en base64
}

// -------------------------
// Meetup fetch
// -------------------------
async function fetchMeetup(origin: string): Promise<any[]> {
  const now = Date.now();
  if (now - meetupCache.timestamp < MEETUP_CACHE_TTL) return meetupCache.data;

  try {
    const fetches = MEETUP_ROUTES.map(r =>
      fetch(`${origin}/api/${r}`).then(res => res.json()).catch(() => [])
    );

    const results = await Promise.all(fetches);
    let events = results.flatMap(r => Array.isArray(r.events) ? r.events : r);

    // Correction des dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    events = events.map(ev => {
      const raw = ev.date || ev.startDate || ev.start;
      const d = raw ? new Date(raw) : null;
      if (!d || isNaN(d.getTime())) return ev;
      if (d < today) {
        const corrected = new Date(today.getFullYear(), today.getMonth(), today.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
        return { ...ev, date: corrected.toISOString() };
      }
      return ev;
    });

    // Déduplication Meetup
    const uniqueMap = new Map<string, any>();
    events.forEach(ev => {
      const key = getUniqueKey({ ...ev, source: "meetup" });
      if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
    });

    meetupCache.timestamp = now;
    meetupCache.data = Array.from(uniqueMap.values());
    return meetupCache.data;
  } catch {
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
  const rawDate = ev.date || ev.start || ev.startDate || ev.date_debut || ev.dateDebut || ev.pubDate || null;
  const dateObj = rawDate ? new Date(rawDate) : null;
  if (!dateObj || isNaN(dateObj.getTime())) return null;

  const dateISO = dateObj.toISOString();
  const dateFormatted = dateObj.toLocaleString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" });
  const fullAddress = ev.fullAddress || ev.location || ev.commune || ev.lieu_nom || ev.adresse || "";
  const location = ev.location || ev.commune || ev.lieu_nom || ev.ville || "";

  let image = PLACEHOLDER_IMAGE;
  switch(sourceName){
    case "tourismehautegaronne": image = ev.image || ev.coverImage || getThemeImage(ev.thematique); break;
    case "demosphere": image = ev.image || "/logo/demosphereoriginal.png"; break;
    case "ut3-min":
    case "capitole-min": {
      const t = (ev.title||"").toLowerCase();
      if(t.includes("ciné")||t.includes("cine")) image="/images/capitole/capicine.jpg";
      else if(t.includes("conf")) image="/images/capitole/capiconf.jpg";
      else if(t.includes("expo")) image="/images/capitole/capiexpo.jpg";
      else image="/images/capitole/capidefaut.jpg";
      break;
    }
  }

  return {
    id: getUniqueKey({ ...ev, source: sourceName }),
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
// Retry fetch
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
// GET principal
// -------------------------
export async function GET(request: NextRequest) {
  let origin = request.nextUrl.origin;
  if (origin.includes("localhost")) origin = "http://localhost:9002";
  else origin = process.env.NEXT_PUBLIC_BASE_URL || origin;

  try {
    const results: { route: string; data: any }[] = [];

    // 1️⃣ Meetup
    const meetupEvents = await fetchMeetup(origin);
    results.push({ route: "meetup", data: { events: meetupEvents } });

    // 2️⃣ Autres routes
    const otherResults = await Promise.all(API_ROUTES.map(async route => {
      try {
        const data = await fetchWithRetry(`${origin}/api/${route}`, 2, 10000);
        return { route, data };
      } catch {
        return { route, data: [] };
      }
    }));
    results.push(...otherResults);

    // 3️⃣ OpenData
    const openDataEvents = await getOpenDataEvents();
    results.push({ route: "opendata", data: openDataEvents });

    // 4️⃣ Normalisation et agrégation
    const allEvents = results.flatMap(({ route, data }) => {
      const list = Array.isArray(data.events) ? data.events : Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
      return list.map(ev => normalizeEvent(ev, route)).filter(Boolean);
    });

    // 5️⃣ Fenêtre 31 jours
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limit = new Date(today); limit.setDate(today.getDate() + 31);
    const filtered = allEvents.filter(ev => {
      const d = new Date(ev.date);
      return d >= today && d <= limit;
    });

    // 6️⃣ Déduplication finale
    const uniq = new Map<string, any>();
    filtered.forEach(ev => {
      const key = ev.id; // déjà unique
      if (!uniq.has(key)) uniq.set(key, ev);
    });

    // 7️⃣ Tri final
    const finalEvents = [...uniq.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ total: finalEvents.length, events: finalEvents });
  } catch (err: any) {
    console.error("🔥 Erreur agendatoulouse:", err);
    return NextResponse.json({ error: err.message || "Erreur interne" }, { status: 500 });
  }
}
