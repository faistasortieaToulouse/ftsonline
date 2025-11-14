const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");

console.log("🚀 Script fetch-events.js démarré");

// --- Configuration et chemins ---
const OUTPUT_VEREL = path.join(process.cwd(), ".vercel/output/static/data/events.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public/data/events.json");

const PlaceHolderImages = [
  { imageUrl: "/placeholder1.jpg", imageHint: "Image 1" },
  { imageUrl: "/placeholder2.jpg", imageHint: "Image 2" },
  { imageUrl: "/placeholder3.jpg", imageHint: "Image 3" },
  { imageUrl: "/placeholder4.jpg", imageHint: "Image 4" },
];

const DEFAULT_TITLE = "Événement sans titre";
const DEFAULT_DESCRIPTION = "Pas de description fournie.";
const DEFAULT_LOCATION = "Lieu à définir";

// --- Helper pour la date ---
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
    description:
      "Un festival de musique annuel présentant des artistes locaux et internationaux.",
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: "static-2",
    name: "Conférence Tech 2024",
    date: addDays(45),
    location: "Centre de Congrès Pierre Baudis, Toulouse",
    description:
      "La plus grande conférence technologique locale autour de l’IA et des technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
];

// --- Déduplication ---
const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    // Clé basée sur le nom normalisé et la date du jour (pour éviter les doublons précis)
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
    const rssUrl = "https://www.lafrenchtechtoulouse.com/feed/";
    // Utilisation d'un proxy pour éviter les problèmes CORS en environnement Node.js si nécessaire
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const text = await res.text();
    const feed = await parser.parseString(text);

    console.log(`\t✔️ French Tech reçu : ${feed.items.length} items`);

    return feed.items.map((item, i) => {
      const placeholder = PlaceHolderImages[i % 4];
      
      // Tente de récupérer l'URL de l'image via l'enclosure
      const imageUrl = item.enclosure?.url || placeholder.imageUrl;

      return {
        id: item.guid || `frenchtech-${i}`,
        name: item.title || DEFAULT_TITLE,
        date: item.isoDate || new Date().toISOString(),
        location: DEFAULT_LOCATION,
        description: item.contentSnippet || item.content || DEFAULT_DESCRIPTION,
        image: imageUrl,
        imageHint: placeholder.imageHint,
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
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const json = await res.json();
    const records = json.records || [];
    console.log(`\t✔️ Haute-Garonne reçu : ${records.length} items`);

    return records.map((r, i) => {
      const f = r.fields || {};
      const placeholder = PlaceHolderImages[i % 4];
      
      // AMÉLIORATION : Tente de trouver un champ d'image (supposition: f.image_url)
      const imageUrl = f.image_url || placeholder.imageUrl;

      return {
        id: f.uid || `hg-${i}`,
        name: f.title || DEFAULT_TITLE,
        // Utilise date_start en priorité, sinon date_debut
        date: f.date_start || f.date_debut || new Date().toISOString(), 
        location: f.venue_name || DEFAULT_LOCATION,
        description: f.description || DEFAULT_DESCRIPTION,
        image: imageUrl,
        imageHint: placeholder.imageHint,
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
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    const json = await res.json();
    const records = json.records || [];
    console.log(`\t✔️ Toulouse Métropole reçu : ${records.length} items`);

    return records.map((r, i) => {
      const f = r.fields || {};
      const placeholder = PlaceHolderImages[(i + 1) % 4];
      
      // AMÉLIORATION : Tente de trouver un champ d'image (supposition: f.illustration)
      const imageUrl = f.illustration || placeholder.imageUrl;

      return {
        id: f.id_manif || `tm-${i}`,
        name: f.titre || DEFAULT_TITLE,
        date: f.date_debut || new Date().toISOString(),
        // Utilise la commune, sinon un lieu plus précis si disponible (à ajuster)
        location: f.commune || DEFAULT_LOCATION, 
        description: f.description || DEFAULT_DESCRIPTION,
        image: imageUrl,
        imageHint: placeholder.imageHint,
      };
    });
  } catch (e) {
    console.error("❌ Toulouse Métropole failed:", e.message);
    return [];
  }
};

// --- Fonction principale ---
const main = async () => {
  console.log("➡️ Récupération des 3 flux en parallèle…");

  const [frenchTech, openDataHG, toulouseMetro] = await Promise.all([
    fetchFrenchTechRSS(),
    fetchOpenData(),
    fetchToulouseMetropole(),
  ]);

  const all = [
    ...initialEvents,
    ...frenchTech,
    ...openDataHG,
    ...toulouseMetro,
  ];

  // Filtre les événements sans titre avant la déduplication (optionnel mais propre)
  const titledEvents = all.filter(e => e.name !== DEFAULT_TITLE);
  
  const unique = deduplicateEvents(titledEvents);
  
  // Filtre pour ne garder que les événements à venir (date >= aujourd'hui)
  const upcoming = unique.filter((e) => new Date(e.date) >= new Date());

  console.log(`⏳ Événements uniques et à venir: ${upcoming.length}`);

  // --- Création dossiers et écriture fichiers ---
  [OUTPUT_VEREL, OUTPUT_PUBLIC].forEach((filePath) => {
    try {
      // S'assure que le dossier de destination existe
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(upcoming, null, 2), "utf8");
      console.log(`✅ events.json écrit dans ${filePath}`);
    } catch (error) {
      console.error(`❌ Échec de l'écriture du fichier ${filePath}:`, error.message);
    }
  });
  
  console.log("✅ Script fetch-events.js terminé.");
};

main();
