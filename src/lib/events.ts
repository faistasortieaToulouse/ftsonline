// src/lib/events.ts
import type { Event } from './types';
import { PlaceHolderImages } from './placeholder-images';
import Parser from 'rss-parser';

// --- Helper pour créer des dates futures ---
const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// --- Événements statiques ---
const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Festival de Musique de Toulouse',
    date: addDays(15),
    location: 'Prairie des Filtres, Toulouse',
    description:
      'Un festival de musique annuel présentant des artistes locaux et internationaux. Un incontournable pour tous les amateurs de musique.',
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: '2',
    name: 'Conférence Tech 2024',
    date: addDays(45),
    location: 'Centre de Congrès Pierre Baudis, Toulouse',
    description:
      "La plus grande conférence technologique de Haute-Garonne, couvrant l'IA, la blockchain et les technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
  {
    id: '3',
    name: 'Marché de Noël',
    date: addDays(120),
    location: 'Place du Capitole, Toulouse',
    description:
      "Le marché de Noël traditionnel. Trouvez des cadeaux uniques, dégustez du vin chaud et imprégnez-vous de l'atmosphère festive.",
    image: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    name: 'Rassemblement Communautaire',
    date: addDays(30),
    location: 'Jardin des Plantes, Toulouse',
    description:
      'Une journée de détente pour la communauté avec des jeux, de la nourriture et de la musique. Parfait pour les familles.',
    image: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
];

// --- Cache mémoire ---
let cachedEvents: Event[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// --- Fetch RSS avec fallback CORS ---
const fetchWithCorsFallback = async (url: string): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    return response;
  } catch (err) {
    console.warn(`Fetch failed for ${url}, trying CORS proxy`, err);
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Proxy fetch failed: ${response.status}`);
    return response;
  }
};

// --- Parse RSS La French Tech Toulouse ---
const parseLaFrenchTechToulouse = async (): Promise<Event[]> => {
  try {
    const parser = new Parser();
    const response = await fetchWithCorsFallback('https://www.lafrenchtechtoulouse.com/feed/');
    const feedText = await response.text();
    const feed = await parser.parseString(feedText);

    return feed.items.map((item, index) => {
      const randomImage = PlaceHolderImages[(index + 4) % PlaceHolderImages.length];
      return {
        id: item.guid || item.link || `french-tech-${index}`,
        name: item.title || 'Événement sans titre',
        date: item.isoDate || new Date().toISOString(),
        location: 'Lieu à définir',
        description: item.contentSnippet || item.content || 'Pas de description.',
        image: item.enclosure?.url || randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error("Failed to parse La French Tech Toulouse RSS feed:", err);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenDataHauteGaronne = async (): Promise<Event[]> => {
  try {
    const res = await fetch(
      'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50'
    );
    if (!res.ok) throw new Error(`OpenData fetch failed: ${res.status}`);
    const json = await res.json();

    return json.records.map((r: any, index: number) => {
      const randomImage = PlaceHolderImages[(index + 8) % PlaceHolderImages.length];
      const fields = r.fields;
      return {
        id: fields.uid || `opendata-${index}`,
        name: fields.title || 'Événement sans titre',
        date: fields.date_start || new Date().toISOString(),
        location: fields.venue_name || 'Lieu à définir',
        description: fields.description || 'Pas de description.',
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error("Failed to fetch OpenData Haute-Garonne:", err);
    return [];
  }
};

// --- Déduplication ---
const deduplicateEvents = (events: Event[]): Event[] => {
  const uniqueMap = new Map<string, Event>();
  events.forEach(event => {
    const key = `${event.name.toLowerCase().trim()}-${event.date.split('T')[0]}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, event);
  });
  return Array.from(uniqueMap.values());
};

// --- Fonction principale pour récupérer tous les événements ---
export const getEvents = async (): Promise<Event[]> => {
  if (cachedEvents && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedEvents;
  }

  try {
    const sources = [
      Promise.resolve(initialEvents),
      parseLaFrenchTechToulouse(),
      fetchOpenDataHauteGaronne(),
    ];

    const allEventsArrays = await Promise.all(sources);
    const flattened = allEventsArrays.flat();
    const uniqueEvents = deduplicateEvents(flattened);

    const upcomingEvents = uniqueEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    cachedEvents = upcomingEvents;
    cacheTimestamp = Date.now();

    return upcomingEvents;
  } catch (err) {
    console.error("Error fetching events, returning initial events only.", err);
    return initialEvents;
  }
};
