/**
 * fetch-events.js
 * ------------------------------
 * Récupère les événements depuis :
 *  - RSS French Tech Toulouse (via proxy)
 *  - API OpenData Toulouse Métropole
 *  - API OpenData Haute-Garonne
 * Puis uniformise, déduplique, filtre, et écrit events.json
 */

const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

console.log("🚀 Script fetch-events.js démarré");

// --- SORTIES ---
const OUTPUT_VEREL = path.join(process.cwd(), ".vercel/output/static/data/events.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public/data/events.json");

// --- Placeholders images ---
const PlaceHolderImages = [
  { imageUrl: "/images/placeholders/placeholder1.jpg", imageHint: "Image 1" },
  { imageUrl: "/images/placeholders/placeholder2.jpg", imageHint: "Image 2" },
  { imageUrl: "/images/placeholders/placeholder3.jpg", imageHint: "Image 3" },
  { imageUrl: "/images/placeholders/placeholder4.jpg", imageHint: "Image 4" },
];

// --- Helper: date +x jours ---
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// --- Événements statiques (optionnel) ---
const initialEvents = [
  {
    id: "static-1",
    name: "Festival de Musique de Toulouse",
    date: addDays(15),
    location: "Prairie des Filtres, Toulouse",
    description: "Un festival de musique annuel présentant des artistes locaux et internationaux.",
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
];

// ---------------------------------------------------------------------------
// 🌐 FETCH: French Tech RSS
// ---------------------------------------------------------------------------

const fetchFrenchTechRSS = async () => {
  console.log("➡️ Fetch French Tech RSS…");
  try {
    const parser = new Parser();
    const proxyUrl =
      "https://api.allorigins.win/raw?url=" +
      encodeURIComponent("https://www.lafrenchtechtoulouse.com/feed/");

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`RSS error ${res.status}`);

    const text = await res.text();
    const feed = await parser.parseString(text);

    console.log("🔍 Exemple BRUT FrenchTech :", JSON.stringify(feed.items[0], null, 2));
    console.log(`   ✔️ ${feed.items.length} items French Tech`);

    return feed.items.map((item, i) => ({
      id: item.guid || `frenchtech-${i}`,
      name: item.title || "Événement sans titre",
      date: item.isoDate || new Date().toISOString(),
      location: "Lieu à définir",
      description: item.contentSnippet || item.content || "Pas de description.",
      image: item.enclosure?.url || PlaceHolderImages[i % 4].imageUrl,
      imageHint: PlaceHolderImages[i % 4].imageHint,
    }));
  } catch (e) {
    console.error("❌ French Tech RSS failed:", e.message);
    return [];
  }
};

// ---------------------------------------------------------------------------
// 🌐 FETCH: API Toulouse Métropole (officielle)
// ---------------------------------------------------------------------------

const fetchToulouseMetropole = async () => {
  console.log("➡️ Fetch Toulouse Métropole (API)…");
  try {
    const url =
      "https://data.toulouse-metropole.fr/api/explore/v2.1/catalog/datasets/" +
      "agenda-des-manifestations-culturelles-so-toulouse/records?limit=500";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TM error ${res.status}`);

    const json = await res.json();
    const records = json.results || [];

    console.log(`   ✔️ ${records.length} items Toulouse Métropole`);
        // 👉 INSERT ICI :
    console.log("🔍 Exemple BRUT TM :", JSON.stringify(records[0], null, 2));

    return records.map((r, i) => ({
      id: r.id_manif || `tm-${i}`,
      name:
        r.titre ||
        r.nom ||
        r.intitule ||
        r.libelle ||
        "Événement sans titre",

      date: r.date_debut || r.date || new Date().toISOString(),
      location: r.commune || r.lieu || "Lieu à définir",

      description:
        r.description ||
        r.resume ||
        r.commentaires ||
        r.infos_pratiques ||
        "Pas de description.",

      image:
        r.image ||
        r.photo_url ||
        (r.media && r.media[0]?.url) ||
        PlaceHolderImages[i % 4].imageUrl,

      imageHint: r.image ? "Image du flux" : PlaceHolderImages[i % 4].imageHint,
    }));
  } catch (e) {
    console.error("❌ Toulouse Métropole failed:", e.message);
    return [];
  }
};

// ---------------------------------------------------------------------------
// 🌐 FETCH: API Haute-Garonne (officielle)
// ---------------------------------------------------------------------------

const fetchOpenDataHG = async () => {
  console.log("➡️ Fetch Haute-Garonne (API)…");
  try {
    const url =
      "https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records?limit=500";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HG error ${res.status}`);

    const json = await res.json();
    const records = json.results || [];

    console.log("🔍 Exemple BRUT HG :", JSON.stringify(records[0], null, 2));
    console.log(`   ✔️ ${records.length} items Haute-Garonne`);

    return records.map((r, i) => ({
      id: r.uid || `hg-${i}`,
      name: r.title || r.nom || "Événement sans titre",

      date: r.firstdate_begin || r.date_debut || new Date().toISOString(),

      location: r.venue_name || r.commune || "Lieu à définir",

      description:
        r.description ||
        r.infos_pratiques ||
        "Pas de description.",

      image:
        r.image ||
        r.photo_url ||
        PlaceHolderImages[i % 4].imageUrl,

      imageHint: PlaceHolderImages[i % 4].imageHint,
    }));
  } catch (e) {
    console.error("❌ Haute-Garonne failed:", e.message);
    return [];
  }
};

// ---------------------------------------------------------------------------
// 🔁 Déduplication
// ---------------------------------------------------------------------------

const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = `${(e.name || "").toLowerCase()}-${(e.date || "").slice(0, 10)}`;
    if (!map.has(key)) map.set(key, e);
  });
  return [...map.values()];
};

// ---------------------------------------------------------------------------
// 🧠 MAIN
// ---------------------------------------------------------------------------

const main = async () => {
  console.log("➡️ Téléchargement des flux…");

  const [frenchTech, tm, hg] = await Promise.all([
    fetchFrenchTechRSS(),
    fetchToulouseMetropole(),
    fetchOpenDataHG(),
  ]);

  let all = [...initialEvents, ...frenchTech, ...tm, ...hg];

  // --- Déduplication ---
  all = deduplicateEvents(all);

  // --- Garder les événements à venir ---
  const upcoming = all.filter((e) => new Date(e.date) >= new Date());

  console.log(`⏳ ${upcoming.length} événements à venir`);

  // --- Warnings ---
  upcoming.forEach((e) => {
    if (e.name === "Événement sans titre") console.warn("⚠️ Sans titre :", e);
    if (e.description === "Pas de description.") console.warn("⚠️ Sans description :", e);
  });

  // --- Écriture fichiers ---
  [OUTPUT_VEREL, OUTPUT_PUBLIC].forEach((filePath) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(upcoming, null, 2), "utf8");
    console.log("✅ events.json écrit :", filePath);
  });
};

main();
