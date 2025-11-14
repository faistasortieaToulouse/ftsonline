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

// Événements statiques
const initialEvents = [
  {
    id: '1',
    name: 'Festival de Musique de Toulouse',
    date: addDays(15),
    location: 'Prairie des Filtres, Toulouse',
    description: 'Un festival de musique annuel présentant des artistes locaux et internationaux.',
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: '2',
    name: 'Conférence Tech 2024',
    date: addDays(45),
    location: 'Centre de Congrès Pierre Baudis, Toulouse',
    description: "La plus grande conférence technologique de Haute-Garonne, IA, blockchain, technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
];

// --- Déduplication ---
const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach((e) => {
    const key = `${e.name.toLowerCase().trim()}-${e.date.split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return Array.from(map.values());
};

// --- Fetch RSS La French Tech Toulouse via proxy ---
const fetchFrenchTechRSS = async () => {
  try {
    const parser = new Parser();
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
      'https://www.lafrenchtechtoulouse.com/feed/'
    )}`;
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`RSS fetch failed with status ${res.status}`);
    const text = await res.text();
    const feed = await parser.parseString(text);

    return feed.items.map((item, i) => {
      const randomImage = PlaceHolderImages[(i + 2) % PlaceHolderImages.length];
      return {
        id: item.guid || item.link || `french-tech-${i}`,
        name: item.title || 'Événement sans titre',
        date: item.isoDate || new Date().toISOString(),
        location: 'Lieu à définir',
        description: item.contentSnippet || item.content || 'Pas de description.',
        image: item.enclosure?.url || randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Impossible de récupérer les événements La French Tech Toulouse.', err.message);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenData = async () => {
  try {
    const url = 'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenData fetch failed with status ${res.status}`);
    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];
      return {
        id: f.uid || `opendata-${i}`,
        name: f.title || f.nom || 'Événement sans titre',
        date: f.date_start || f.date_debut || new Date().toISOString(),
        location: f.venue_name || f.lieu || 'Lieu à définir',
        description: f.description || 'Pas de description.',
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Impossible de récupérer les événements Haute-Garonne OpenData.', err.message);
    return [];
  }
};

// --- Fetch OpenData Toulouse Métropole ---
const fetchToulouseOpenData = async () => {
  try {
    const url = 'https://data.toulouse-metropole.fr/api/records/1.0/search/?dataset=agenda-des-manifestations-culturelles-so-toulouse&rows=50';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Toulouse OpenData fetch failed with status ${res.status}`);
    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];
      return {
        id: f.uid || `toulouse-${i}`,
        name: f.title || f.nom || 'Événement sans titre',
        date: f.start_date || f.date_debut || new Date().toISOString(),
        location: f.venue_name || f.lieu || 'Lieu à définir',
        description: f.description || 'Pas de description.',
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Impossible de récupérer les événements Toulouse Métropole.', err.message);
    return [];
  }
};

// --- Fonction principale ---
const main = async () => {
  console.log('🔄 Récupération des événements...');
  const [frenchTech, openData, toulouseData] = await Promise.all([
    fetchFrenchTechRSS(),
    fetchOpenData(),
    fetchToulouseOpenData(),
  ]);

  const allEvents = [...initialEvents, ...frenchTech, ...openData, ...toulouseData];
  const uniqueEvents = deduplicateEvents(allEvents);
  const upcomingEvents = uniqueEvents.filter((e) => new Date(e.date) >= new Date());

  const filePath = path.join(__dirname, '../public/data/events.json');
  fs.writeFileSync(filePath, JSON.stringify(upcomingEvents, null, 2), 'utf-8');
  console.log(`✅ events.json généré avec ${upcomingEvents.length} événements`);
};

main();
