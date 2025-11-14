// scripts/fetch-events.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const Parser = require('rss-parser');

const PlaceHolderImages = [
  { imageUrl: '/placeholder1.jpg', imageHint: 'Image 1' },
  { imageUrl: '/placeholder2.jpg', imageHint: 'Image 2' },
  { imageUrl: '/placeholder3.jpg', imageHint: 'Image 3' },
  { imageUrl: '/placeholder4.jpg', imageHint: 'Image 4' },
];

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// --- Événements statiques ---
const initialEvents = [
  {
    id: 'static-1',
    name: 'Festival de Musique de Toulouse',
    date: addDays(15),
    location: 'Prairie des Filtres, Toulouse',
    description: 'Un festival de musique annuel présentant des artistes locaux et internationaux.',
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: 'static-2',
    name: 'Conférence Tech 2024',
    date: addDays(45),
    location: 'Centre de Congrès Pierre Baudis, Toulouse',
    description: "La plus grande conférence technologique locale autour de l’IA et des technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  }
];

// --- Déduplication ---
const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = `${e.name.toLowerCase().trim()}-${(e.date || "").split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return [...map.values()];
};

// --- Fetch French Tech RSS ---
const fetchFrenchTechRSS = async () => {
  try {
    const parser = new Parser();
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      "https://www.lafrenchtechtoulouse.com/feed/"
    )}`;

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error("RSS error");

    const text = await res.text();
    const feed = await parser.parseString(text);

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
    console.error("❌ FrenchTech RSS failed:", e.message);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenData = async () => {
  try {
    const url =
      "https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50";

    const res = await fetch(url);
    if (!res.ok) throw new Error("OpenData HG error");

    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};

      return {
        id: f.uid || `hg-${i}`,
        name: f.title || "Événement sans titre",
        date: f.date_start || f.date_debut || new Date().toISOString(),
        location: f.venue_name || "Lieu à définir",
        description: f.description || "Pas de description.",
        image: PlaceHolderImages[i % 4].imageUrl,
        imageHint: PlaceHolderImages[i % 4].imageHint,
      };
    });
  } catch (e) {
    console.error("❌ OpenData HG failed:", e.message);
    return [];
  }
};

// --- Fetch Toulouse Métropole ---
const fetchToulouseMetropole = async () => {
  try {
    const url =
      "https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=50";

    const res = await fetch(url);
    if (!res.ok) throw new Error("OpenData Toulouse Métropole error");

    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};

      return {
        id: f.id_manif || `tm-${i}`,
        name: f.titre || "Événement sans titre",
        date: f.date_debut || new Date().toISOString(),
        location: f.commune || "Lieu à définir",
        description: f.description || "Pas de description.",
        image: PlaceHolderImages[(i + 1) % 4].imageUrl,
        imageHint: PlaceHolderImages[(i + 1) % 4].imageHint,
      };
    });
  } catch (e) {
    console.error("❌ Toulouse Métropole failed:", e.message);
    return [];
  }
};

// --- Fonction principale ---
const main = async () => {
  const [frenchTech, openDataHG, toulouseMetro] = await Promise.all([
    fetchFrenchTechRSS(),
    fetchOpenData(),
    fetchToulouseMetropole(),
  ]);

  const all = [
    ...initialEvents,
    ...frenchTech,
    ...openDataHG,
    ...toulouseMetro
  ];

  const unique = deduplicateEvents(all);

  const upcoming = unique.filter((e) => new Date(e.date) >= new Date());

  const filePath = path.join(__dirname, "../public/data/events.json");

  fs.writeFileSync(filePath, JSON.stringify(upcoming, null, 2), "utf8");

  console.log(`✅ events.json généré avec ${upcoming.length} événements`);
};

main();
