// scripts/fetch-events.js
const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");
const cheerio = require("cheerio");

console.log("🚀 Script fetch-events.js démarré");

// --- Dossiers de sortie ---
const OUTPUT_VEREL = path.join(process.cwd(), ".vercel/output/static/data/events.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public/data/events.json");

// Placeholders
const PlaceHolderImages = [
  { imageUrl: "/placeholder1.jpg", imageHint: "Image 1" },
  { imageUrl: "/placeholder2.jpg", imageHint: "Image 2" },
  { imageUrl: "/placeholder3.jpg", imageHint: "Image 3" },
  { imageUrl: "/placeholder4.jpg", imageHint: "Image 4" },
];

// Helper date
const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// --- Événements statiques ---
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
  {
    id: "static-2",
    name: "Conférence Tech 2024",
    date: addDays(45),
    location: "Centre de Congrès Pierre Baudis, Toulouse",
    description: "La plus grande conférence technologique locale autour de l’IA et des technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
];

// --- Déduplication robuste ---
const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = e.id || `${e.name?.toLowerCase().trim()}-${(e.date || "").split("T")[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return [...map.values()];
};

// --- Fetch French Tech RSS ---
const fetchFrenchTechRSS = async () => {
  console.log("➡️ Fetch French Tech…");
  try {
    const parser = new Parser();
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      "https://www.lafrenchtechtoulouse.com/feed/"
    )}`;

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`RSS error ${res.status}`);

    const text = await res.text();
    const feed = await parser.parseString(text);

    console.log(`   ✔️ French Tech reçu : ${feed.items.length} items`);

    return feed.items.map((item, i) => {
      // Essayer d'extraire une image du contenu HTML
      let imageUrl = item.enclosure?.url || item["media:content"]?.url;
      if (!imageUrl && item.content) {
        const $ = cheerio.load(item.content);
        imageUrl = $("img").attr("src");
      }
      return {
        id: item.guid || `frenchtech-${i}`,
        name: item.title?.trim() || item.link || "Événement sans titre",
        date: item.isoDate || new Date().toISOString(),
        location: "Lieu à définir",
        description: item.contentSnippet || item.content || "Pas de description.",
        image: imageUrl || PlaceHolderImages[i % 4].imageUrl,
        imageHint: imageUrl ? "Image extraite du flux" : PlaceHolderImages[i % 4].imageHint,
      };
    });
  } catch (e) {
    console.error("❌ FrenchTech RSS failed:", e.message);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenData = async () => {
  console.log("➡️ Fetch Haute-Garonne…");
  try {
    const url =
      "https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HG error ${res.status}`);

    const json = await res.json();
    console.log(`   ✔️ Haute-Garonne reçu : ${(json.records || []).length} items`);

    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};
      return {
        id: f.uid || `hg-${i}`,
        name: f.title || f.nom || f.theme || "Événement sans titre",
        date: f.date_start || f.date_debut || new Date().toISOString(),
        location: f.venue_name || f.commune || "Lieu à définir",
        description: f.description || "Pas de description.",
        image: f.image || f.media || PlaceHolderImages[i % 4].imageUrl,
        imageHint: f.image || f.media ? "Image OpenData HG" : PlaceHolderImages[i % 4].imageHint,
      };
    });
  } catch (e) {
    console.error("❌ OpenData HG failed:", e.message);
    return [];
  }
};

// --- Fetch Toulouse Métropole ---
const fetchToulouseMetropole = async () => {
  console.log("➡️ Fetch Toulouse Métropole…");
  try {
    const url =
      "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=50";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`TM error ${res.status}`);

    const json = await res.json();
    console.log(`   ✔️ Toulouse Métropole reçu : ${(json.records || []).length} items`);

    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};
      return {
        id: f.id_manif || `tm-${i}`,
        name: f.titre || f.nom || f.theme || "Événement sans titre",
        date: f.date_debut || new Date().toISOString(),
        location: f.commune || "Lieu à définir",
        description: f.description || "Pas de description.",
        image: f.illustration || f.image || PlaceHolderImages[(i + 1) % 4].imageUrl,
        imageHint: f.illustration || f.image ? "Image Toulouse Métropole" : PlaceHolderImages[(i + 1) % 4].imageHint,
      };
    });
  } catch (e) {
    console.error("❌ Toulouse Métropole failed:", e.message);
    return [];
  }
};

// --- Fonction principale ---
const main = async () => {
  console.log("➡️ Récupération des 3 flux…");

  const [frenchTech, openDataHG, toulouseMetro] = await Promise.all([
    fetchFrenchTechRSS(),
    fetchOpenData(),
    fetchToulouseMetropole(),
  ]);

  const all = [...initialEvents, ...frenchTech, ...openDataHG, ...toulouseMetro];
  const unique = deduplicateEvents(all);
  const upcoming = unique.filter((e) => new Date(e.date) >= new Date());

  console.log(`⏳ Événements à venir: ${upcoming.length}`);

  // --- Création dossiers et écriture fichiers ---
  [OUTPUT_VEREL, OUTPUT_PUBLIC].forEach((filePath) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(upcoming, null, 2), "utf8");
    console.log(`✅ events.json écrit dans ${filePath}`);
  });
};

main();
