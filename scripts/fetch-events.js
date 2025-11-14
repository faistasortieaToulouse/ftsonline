const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

console.log("🚀 Script fetch-events.js démarré");

// --- Dossiers de sortie pour Vercel et public ---
const OUTPUT_VEREL = path.join(process.cwd(), ".vercel/output/static/data/events.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public/data/events.json");

// --- Placeholders ---
const PlaceHolderImages = [
  { imageUrl: '/images/placeholders/placeholder1.jpg', imageHint: 'Image 1' },
  { imageUrl: '/images/placeholders/placeholder2.jpg', imageHint: 'Image 2' },
  { imageUrl: '/images/placeholders/placeholder3.jpg', imageHint: 'Image 3' },
  { imageUrl: '/images/placeholders/placeholder4.jpg', imageHint: 'Image 4' },
];

// --- Helper date ---
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

// --- Déduplication ---
const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = `${e.name?.toLowerCase().trim()}-${(e.date || "").split("T")[0]}`;
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

    return feed.items.map((item, i) => ({
      id: item.guid || `frenchtech-${i}`,
      name: item.title?.trim() || "Événement sans titre",
      date: item.isoDate || new Date().toISOString(),
      location: item.location || "Lieu à définir",
      description: item.contentSnippet?.trim() || item.content?.trim() || "Pas de description.",
      image: item.enclosure?.url || PlaceHolderImages[i % 4].imageUrl,
      imageHint: item.enclosure?.url ? "Image officielle" : PlaceHolderImages[i % 4].imageHint,
    }));
  } catch (e) {
    console.error("❌ FrenchTech RSS failed:", e.message);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenData = async () => {
  console.log("➡️ Fetch Haute-Garonne…");
  try {
    const url = "https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=200";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HG error ${res.status}`);

    const json = await res.json();
    const records = json.records || [];
    console.log(`   ✔️ Haute-Garonne reçu : ${records.length} items`);

    return records.map((r, i) => {
      const f = r.fields || {};
      const imageField = f.image || f.photo || f.media; // Vérifie les champs possibles
      return {
        id: f.uid || `hg-${i}`,
        name: f.title?.trim() || "Événement sans titre",
        date: f.date_start || f.date_debut || new Date().toISOString(),
        location: f.venue_name || "Lieu à définir",
        description: f.description?.trim() || "Pas de description.",
        image: imageField || PlaceHolderImages[i % 4].imageUrl,
        imageHint: imageField ? "Image officielle" : PlaceHolderImages[i % 4].imageHint,
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
    const url = "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=200";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TM error ${res.status}`);

    const json = await res.json();
    const records = json.records || [];
    console.log(`   ✔️ Toulouse Métropole reçu : ${records.length} items`);

    return records.map((r, i) => {
      const f = r.fields || {};
      const imageField = f.image || f.media || f.photo; // Vérifie les champs possibles
      return {
        id: f.id_manif || `tm-${i}`,
        name: f.titre?.trim() || "Événement sans titre",
        date: f.date_debut || new Date().toISOString(),
        location: f.commune || "Lieu à définir",
        description: f.description?.trim() || "Pas de description.",
        image: imageField || PlaceHolderImages[(i + 1) % 4].imageUrl,
        imageHint: imageField ? "Image officielle" : PlaceHolderImages[(i + 1) % 4].imageHint,
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

  const allEvents = [...initialEvents, ...frenchTech, ...openDataHG, ...toulouseMetro];
  const uniqueEvents = deduplicateEvents(allEvents);
  const upcoming = uniqueEvents.filter((e) => new Date(e.date) >= new Date());

  console.log(`⏳ Événements à venir: ${upcoming.length}`);

  // --- Création dossiers et écriture fichiers ---
  [OUTPUT_VEREL, OUTPUT_PUBLIC].forEach((filePath) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(upcoming, null, 2), "utf8");
    console.log(`✅ events.json écrit dans ${filePath}`);
  });
};

main();
