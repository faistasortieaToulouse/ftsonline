import type { Event } from './types';
import { PlaceHolderImages } from './placeholder-images';
import Parser from 'rss-parser';
import * as cheerio from "cheerio";

const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Événements statiques
const initialEvents: Event[] = [
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
  {
    id: '3',
    name: 'Marché de Noël',
    date: addDays(120),
    location: 'Place du Capitole, Toulouse',
    description: "Le marché de Noël traditionnel avec cadeaux, vin chaud et ambiance festive.",
    image: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    name: 'Rassemblement Communautaire',
    date: addDays(30),
    location: 'Jardin des Plantes, Toulouse',
    description: 'Une journée détente pour la communauté avec jeux, musique et nourriture.',
    image: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
];

// --- Cache serveur ---
let cachedEvents: Event[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// Déduplication
const deduplicateEvents = (events: Event[]): Event[] => {
  const map = new Map<string, Event>();
  events.forEach(e => {
    const key = `${e.name.toLowerCase().trim()}-${e.date.split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return Array.from(map.values());
};

// --- RSS La French Tech Toulouse ---
const parseLaFrenchTechToulouse = async (): Promise<Event[]> => {
  try {
    const parser = new Parser();
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent('https://www.lafrenchtechtoulouse.com/feed/')}`;
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`RSS fetch failed, status ${res.status}`);
    const text = await res.text();
    const feed = await parser.parseString(text);

return feed.items.map((item, i) => {
  const randomImage = PlaceHolderImages[(i + 4) % PlaceHolderImages.length];

  // --- Extraction d'image depuis le HTML (cheerio) ---
  let imageUrl = item.enclosure?.url || item["media:content"]?.url;

  if (!imageUrl && item.content) {
    const $ = cheerio.load(item.content);
    const img = $("img").first().attr("src");
    if (img) imageUrl = img;
  }

  const date = item.isoDate ? new Date(item.isoDate).toISOString() : new Date().toISOString();

  return {
    id: item.guid || item.link || `french-tech-${i}`,
    name: item.title || 'Événement sans titre',
    date,
    location: 'Lieu à définir',
    description: item.contentSnippet || item.content || 'Pas de description.',
    image: imageUrl || randomImage.imageUrl,
    imageHint: randomImage.imageHint,
  };
});

  } catch (err) {
    console.error('⚠️ Impossible de récupérer les événements de La French Tech Toulouse.', err);
    return [];
  }
};

// --- OpenData Haute-Garonne ---
const fetchOpenDataHauteGaronne = async (): Promise<Event[]> => {
  try {
    const url =
      'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenData fetch failed, status ${res.status}`);
    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r: any, i: number) => {
      const f = r.fields || {};
      const date = f.date_start || f.date_debut || new Date().toISOString();
      const name = f.title || f.nom || 'Événement sans titre';
      const location = f.venue_name || f.lieu || 'Lieu à définir';
      const description = f.description || 'Pas de description.';
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];
      return {
        id: f.uid || `opendata-${i}`,
        name,
        date,
        location,
        description,
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Impossible de récupérer les événements de Haute-Garonne OpenData.', err);
    return [];
  }
};

// --- Fonction principale ---
export const getEvents = async (): Promise<Event[]> => {
  if (cachedEvents && Date.now() - cacheTime < CACHE_DURATION) return cachedEvents;

  try {
    console.log('Fetching events...');
    const [frenchTech, openData] = await Promise.all([
      parseLaFrenchTechToulouse(),
      fetchOpenDataHauteGaronne(),
    ]);

    const allEvents = [...initialEvents, ...frenchTech, ...openData];
    const validEvents = allEvents.filter(e => !isNaN(new Date(e.date).getTime()));
    const uniqueEvents = deduplicateEvents(validEvents);
    const upcomingEvents = uniqueEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    cachedEvents = upcomingEvents;
    cacheTime = Date.now();

    console.log('Upcoming events count:', upcomingEvents.length);
    return upcomingEvents;
  } catch (err) {
    console.error('getEvents failed, returning static events only:', err);
    return initialEvents;
  }
};
