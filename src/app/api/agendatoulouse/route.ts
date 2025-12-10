// src/app/api/agendatoulouse/route.ts
import { NextRequest, NextResponse } from "next/server";

// ⚡ La route est dynamique pour fetch côté serveur
export const dynamic = "force-dynamic";
export const revalidate = 3600;

// ---------------------------------------------------------
// Toutes les routes API à agréger
// ---------------------------------------------------------
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
  "meetup-full", // ⚡ Agrégation Meetup
];

// ---------------------------------------------------------
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

// ---------------------------------------------------------
function normalize(str?: string) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getThemeImage(thematique?: string): string {
  if (!thematique) return DEFAULT_THEME_IMAGE;
  const t = normalize(thematique.trim());
  if (t.startsWith("education")) return THEME_IMAGES["Education Emploi"];
  for (const key of Object.keys(THEME_IMAGES)) {
    if (normalize(key) === t) return THEME_IMAGES[key];
  }
  return DEFAULT_THEME_IMAGE;
}

// ---------------------------------------------------------
function normalizeEvent(ev: any, sourceName: string) {
  if (!ev) return null;

  // Dates
  const rawDate = ev.date || ev.start || ev.startDate || ev.date_debut || ev.dateDebut || null;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const dateISO = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString() : null;
  const dateFormatted = dateObj
    ? dateObj.toLocaleString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const fullAddress = ev.fullAddress || ev.location || ev.commune || ev.lieu_nom || ev.adresse || "";
  const location = ev.location || ev.commune || ev.lieu_nom || ev.ville || "";

  // Images
  let image: string;
  switch (sourceName) {
    case "tourismehautegaronne":
      image = ev.image || ev.coverImage || getThemeImage(ev.thematique) || DEFAULT_THEME_IMAGE;
      break;
    case "demosphere":
      image = ev.image || ev.coverImage || "/logo/demosphereoriginal.png";
      break;
    case "ut3-min":
    case "capitole-min":
      const titleLower = (ev.title || "").toLowerCase();
      if (titleLower.includes("ciné") || titleLower.includes("cine")) image = "/images/capitole/capicine.jpg";
      else if (titleLower.includes("conf")) image = "/images/capitole/capiconf.jpg";
      else if (titleLower.includes("expo")) image = "/images/capitole/capiexpo.jpg";
      else image = "/images/capitole/capidefaut.jpg";
      break;
    default:
      image = ev.image || ev.coverImage || PLACEHOLDER_IMAGE;
  }

  return {
    id: ev.id || `${ev.title || "event"}-${dateISO || ""}`,
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

// ---------------------------------------------------------
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

// ---------------------------------------------------------
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    // 1️⃣ Récupération des données
    const results = await Promise.all(
      API_ROUTES.map(async (route) => {
        try {
          const data = await fetchWithRetry(`${origin}/api/${route}`);
          return Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
        } catch {
          return [];
        }
      })
    );

    // 2️⃣ Normalisation
    const allEvents = results.flat().map(ev => normalizeEvent(ev, ev.source || "unknown")).filter(Boolean);

    // 3️⃣ Filtrer sur 31 jours (ou garder sans date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 31);

    const filtered = allEvents.filter(ev => {
      if (!ev.date) return true;
      const d = new Date(ev.date);
      return !isNaN(d.getTime()) && d >= today && d < limit;
    });

    // 4️⃣ Unicité
    const seen = new Set<string>();
    const uniqueEvents = filtered.filter(ev => {
      const key = `${ev.title}-${ev.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 5️⃣ Tri
    const sortedEvents = uniqueEvents.sort(
      (a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime()
    );

    return NextResponse.json({ total: sortedEvents.length, events: sortedEvents });
  } catch (err: any) {
    console.error("Erreur agendatoulouse:", err);
    return NextResponse.json({ total: 0, events: [], error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
