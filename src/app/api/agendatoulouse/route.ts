import { NextRequest, NextResponse } from "next/server";

const API_ROUTES = [
  "agenda-trad",
  "cultureenmouvements",
  "demosphere",
  "hautegaronne",
  "radarsquat",
  "toulousemetropole",
  "tourismehautegaronne",
  "meetup-full",
];

// 📌 Placeholder par défaut
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

/**
 * Normalisation d'un événement
 */
function normalizeEvent(ev: any, sourceName: string) {
  if (!ev) return null;

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

  // 🔵 Gestion spécifique Demosphere
  const image =
    ev.image ||
    ev.coverImage ||
    (sourceName === "demosphere" ? "/logo/demosphereoriginal.png" : PLACEHOLDER_IMAGE);

  const url = ev.url || ev.link || "";

  const source = ev.source || sourceName;

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

/**
 * GET : agrégation
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const results = await Promise.all(
      API_ROUTES.map(route =>
        fetch(`${origin}/api/${route}`)
          .then(res => res.json())
          .then(data => ({ route, data }))
          .catch(() => ({ route, data: [] }))
      )
    );

    const allEvents = results.flatMap(({ route, data }) => {
      const list = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
      return list.map(ev => normalizeEvent(ev, route)).filter(Boolean);
    });

    const now = new Date();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const limitDate = new Date(nowDate);
    limitDate.setDate(limitDate.getDate() + 31);

    const filtered = allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate >= nowDate && evDate < limitDate;
    });

    // Supprimer doublons
    const uniqMap = new Map<string, any>();
    filtered.forEach(ev => {
      const key = `${ev.title}-${ev.date}`;
      if (!uniqMap.has(key)) uniqMap.set(key, ev);
    });

    const finalEvents = Array.from(uniqMap.values());

    // Tri chronologique
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
