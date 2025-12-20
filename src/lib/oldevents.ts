import type { Event } from './types';
import { PlaceHolderImages } from './placeholder-images';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

const addDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// ---------------------------------------------------------
// Événements statiques fallback
// ---------------------------------------------------------
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
    description: 'Technologies, IA, blockchain et innovations locales.',
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
  {
    id: '3',
    name: 'Marché de Noël',
    date: addDays(120),
    location: 'Place du Capitole, Toulouse',
    description: 'Le marché de Noël traditionnel avec vin chaud et ambiance festive.',
    image: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    name: 'Rassemblement Communautaire',
    date: addDays(30),
    location: 'Jardin des Plantes, Toulouse',
    description: 'Journée détente pour la communauté avec jeux et musique.',
    image: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
];

// ---------------------------------------------------------
// Cache serveur
// ---------------------------------------------------------
let cachedEvents: Event[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 15; // 15 min

// ---------------------------------------------------------
// Déduplication
// ---------------------------------------------------------
const deduplicateEvents = (events: Event[]): Event[] => {
  const map = new Map<string, Event>();

  events.forEach(e => {
    const key = `${e.name?.toLowerCase().trim() || 'x'}-${e.date.split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });

  return Array.from(map.values());
};

// ---------------------------------------------------------
// RSS : La French Tech Toulouse
// ---------------------------------------------------------
const parseLaFrenchTechToulouse = async (): Promise<Event[]> => {
  try {
    const parser = new Parser();

    // 🔥 Proxy compatible Vercel
    const proxyUrl =
      'https://api.allorigins.win/raw?url=' +
      encodeURIComponent('https://www.lafrenchtechtoulouse.com/feed/');

    const res = await fetch(proxyUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      console.error('RSS fetch failed:', res.status);
      return [];
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);

    return feed.items.map((item, i) => {
      const randomImage = PlaceHolderImages[(i + 4) % PlaceHolderImages.length];

      // ---------- extraction image ----------
      let imageUrl =
        item.enclosure?.url ||
        item['media:content']?.url ||
        item['media:thumbnail']?.url;

      if (!imageUrl && item.content) {
        const $ = cheerio.load(item.content);
        imageUrl = $('img').first().attr('src') || null;
      }

      const title =
        item.title?.trim() ||
        item.link?.split('/').pop()?.replace(/[-_]/g, ' ') ||
        'Événement sans titre';

      const description =
        item.contentSnippet?.trim() ||
        cheerio.load(item['content:encoded'] || item.content || '')('p')
          .first()
          .text()
          .trim() ||
        'Pas de description.';

      const iso = item.isoDate
        ? new Date(item.isoDate).toISOString()
        : new Date().toISOString();

      return {
        id: item.guid || item.link || `french-tech-${i}`,
        name: title,
        date: iso,
        location: 'Lieu à définir',
        description,
        image: imageUrl || randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Impossible de récupérer la French Tech:', err);
    return [];
  }
};

// ---------------------------------------------------------
// OpenData Haute-Garonne
// ---------------------------------------------------------
const fetchOpenDataHauteGaronne = async (): Promise<Event[]> => {
  try {
    const url =
      'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=100';

    const res = await fetch(url);
    if (!res.ok) throw new Error(`status ${res.status}`);

    const json = await res.json();
    if (!json.records) return [];

    return json.records.map((r: any, i: number) => {
      const f = r.fields || {};
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];

      const date =
        f.date_start || f.date_debut || new Date().toISOString();

      const name =
        f.title ||
        f.nom ||
        f.venue_name ||
        'Événement sans titre';

      const description =
        f.description ||
        f.resume ||
        'Pas de description.';

      return {
        id: f.uid || `opendata-${i}`,
        name,
        date,
        location: f.venue_name || f.lieu || 'Lieu à définir',
        description,
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('⚠️ Haute-Garonne Error:', err);
    return [];
  }
};

// ---------------------------------------------------------
// Fonction principale
// ---------------------------------------------------------
export const getEvents = async (): Promise<Event[]> => {
  if (cachedEvents && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedEvents;
  }

  try {
    console.log('Fetching events...');

    const [frenchTech, openData] = await Promise.all([
      parseLaFrenchTechToulouse(),
      fetchOpenDataHauteGaronne(),
    ]);

    const all = [...initialEvents, ...frenchTech, ...openData];

    const valid = all.filter(e => !isNaN(new Date(e.date).getTime()));

    const unique = deduplicateEvents(valid);

    const upcoming = unique
      .filter(e => new Date(e.date) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

    cachedEvents = upcoming;
    cacheTime = Date.now();

    console.log('Upcoming events count:', upcoming.length);

    return upcoming;
  } catch (err) {
    console.error('getEvents failed:', err);
    return initialEvents;
  }
};
