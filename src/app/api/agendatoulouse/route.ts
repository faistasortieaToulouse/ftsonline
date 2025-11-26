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

// -------------------------------------------------------------------------
// 🔵 TABLE DES IMAGES DE THÈMES TOURISME 31
// -------------------------------------------------------------------------
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

// Image générique locale
const DEFAULT_THEME_IMAGE = "/images/tourismehg31/placeholder.jpg";

// Normalisation simple
function normalize(str?: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// -------------------------------------------------------------------------
// 🔵 Retourne l’image correspondant à la thématique Tourisme HG31
// -------------------------------------------------------------------------
function getThemeImage(thematique?: string): string {
  if (!thematique) return DEFAULT_THEME_IMAGE;

  const t = normalize(thematique.trim());

  // Match simplifié Education
  if (t.startsWith("education")) {
    return THEME_IMAGES["Education Emploi"];
  }

  // Correspondance exacte
  if (THEME_IMAGES[thematique]) {
    return THEME_IMAGES[thematique];
  }

  return DEFAULT_THEME_IMAGE;
}

// -------------------------------------------------------------------------
// 🔵 Normalisation d'un événement
// -------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // 🟣 PRIORITÉ DES IMAGES (selon source)
  // ---------------------------------------------------------------------

  let image;

  if (sourceName === "tourismehautegaronne") {
    // 🔥 Utilisation de ton image thématique si aucune image fournie par l’API
    image =
      ev.image ||
      ev.coverImage ||
      getThemeImage(ev.thematique) || // 🎯 Ajout ici
      DEFAULT_THEME_IMAGE;
  } else if (sourceName === "demosphere") {
    image =
      ev.image ||
      ev.coverImage ||
      "/logo/demosphereoriginal.png";
  } else {
    image =
      ev.image ||
      ev.coverImage ||
      PLACEHOLDER_IMAGE;
  }

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

// -------------------------------------------------------------------------
// 🔵 GET : agrégation des événements
// -------------------------------------------------------------------------
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
      const list = Array.isArray(data.events)
        ? data.events
        : Array.isArray(data)
        ? data
        : [];

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
