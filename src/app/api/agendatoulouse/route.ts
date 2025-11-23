import { NextRequest, NextResponse } from "next/server";

const API_ROUTES = [
  "agenda-trad",
  "cultureenmouvements",
  "demosphere",
  "hautegaronne",
  "radarsquat",
  "toulousemetropole",
  "tourismehautegaronne",
  "meetup-events",
];

// 📌 Placeholder en cas d’image manquante
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

/**
 * Normalisation d'un événement venant de n'importe quelle source.
 */
function normalizeEvent(ev: any, sourceName: string) {
  if (!ev) return null;

  // ————————————————————————————
  // 🕒 Normalisation des dates
  // ————————————————————————————
  const rawDate =
    ev.date ||
    ev.start ||
    ev.startDate ||
    ev.date_debut ||
    ev.dateDebut ||
    null;

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

  // ————————————————————————————
  // 📍 Normalisation du lieu
  // ————————————————————————————
  const fullAddress =
    ev.fullAddress ||
    ev.location ||
    ev.commune ||
    ev.lieu_nom ||
    ev.adresse ||
    "";

  const location =
    ev.location ||
    ev.commune ||
    ev.lieu_nom ||
    ev.ville ||
    "";

  // ————————————————————————————
  // 🖼 Normalisation de l’image
  // ————————————————————————————
  const image =
    ev.image ||
    ev.coverImage ||
    PLACEHOLDER_IMAGE;

  // ————————————————————————————
  // 🔗 Normalisation de l’URL
  // ————————————————————————————
  const url =
    ev.url ||
    ev.link ||
    "";

  // ————————————————————————————
  // 🏷 Source
  // ————————————————————————————
  const source = ev.source || sourceName;

  // ————————————————————————————
  // 🧱 Construction de l’événement normalisé
  // ————————————————————————————
  return {
    id: ev.id || `${ev.title}-${dateISO}`,
    title: ev.title || "Événement",
    description: ev.description || "",
    date: dateISO,
    dateFormatted,
    location,
    fullAddress,
    image,
    url,
    source,
  };
}

// ————————————————————————————
// MAIN : GET
// ————————————————————————————
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const fetchPromises = API_ROUTES.map(route =>
    fetch(`${origin}/api/${route}`)
      .then(res => res.json())
      .then(data => ({ route, data }))
      .catch(() => ({ route, data: [] }))
  );

  try {
    const results = await Promise.all(fetchPromises);

    // 🔵 Fusion de tous les flux
    const allEvents = results.flatMap(({ route, data }) => {
      const list = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return list.map(ev => normalizeEvent(ev, route)).filter(Boolean);
    });

    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 31);

    // 🔵 Filtrer aujourd’hui → +31 jours
    const filtered = allEvents.filter(ev => {
      const d = new Date(ev.date);
      return d >= now && d <= limit;
    });

    // 🔵 Supprimer doublons selon title + date
    const uniqMap = new Map<string, any>();
    filtered.forEach(ev => {
      const key = `${ev.title}-${ev.date}`;
      if (!uniqMap.has(key)) uniqMap.set(key, ev);
    });

    const finalEvents = Array.from(uniqMap.values());

    // 🔵 Tri chronologique
    finalEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      total: finalEvents.length,
      events: finalEvents,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'agrégation" },
      { status: 500 }
    );
  }
}
