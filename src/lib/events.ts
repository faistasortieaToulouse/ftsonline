// src/lib/events.ts
import type { Event } from './types';
import { PlaceHolderImages } from './placeholder-images';
import Parser from 'rss-parser';

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

// --- Déduplication ---
const deduplicateEvents = (events: Event[]): Event[] => {
  const map = new Map<string, Event>();
  events.forEach(e => {
    const key = `${e.name.toLowerCase().trim()}-${e.date.split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return Array.from(map.values());
};

// --- Fetch RSS La French Tech Toulouse via proxy ---
const parseLaFrenchTechToulouse = async (): Promise<Event[]> => {
  try {
    const parser = new Parser();
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.lafrenchtechtoulouse.com/feed/')}`;
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('[RSS] Status:', res.status);
    if (!res.ok) throw new Error('RSS fetch failed');
    const text = await res.text();
    const feed = await parser.parseString(text);
    console.log('[RSS] Items:', feed.items.length);

    return feed.items.map((item, i) => {
      const randomImage = PlaceHolderImages[(i + 4) % PlaceHolderImages.length];
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
    console.error('[RSS] La French Tech Toulouse fetch failed:', err);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenDataHauteGaronne = async (): Promise<Event[]> => {
  try {
    const url = 'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50';
    const res = await fetch(url);
    console.log('[OpenData] Status:', res.status);
    if (!res.ok) throw new Error('OpenData fetch failed');

    const json = await res.json();
    console.log('[OpenData] Records:', json.records?.length || 0);

    if (!json.records) return [];

    return json.records.map((r: any, i: number) => {
      const fields = r.fields || {};
      const randomImage = PlaceHolderImages[(i + 8) % PlaceHolderImages.length];
      return {
        id: fields.uid || `opendata-${i}`,
        name: fields.title || 'Événement sans titre',
        date: fields.date_start || new Date().toISOString(),
        location: fields.venue_name || 'Lieu à définir',
        description: fields.description || 'Pas de description.',
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('[OpenData] Haute-Garonne fetch failed:', err);
    return [];
  }
};

// --- Fonction principale ---
export const getEvents = async (): Promise<Event[]> => {
  try {
    console.log('Fetching events...');
    const [frenchTech, openData] = await Promise.all([
      parseLaFrenchTechToulouse(),
      fetchOpenDataHauteGaronne(),
    ]);

    const allEvents = [...initialEvents, ...frenchTech, ...openData];
    const uniqueEvents = deduplicateEvents(allEvents);

    const upcomingEvents = uniqueEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Upcoming events count:', upcomingEvents.length);
    return upcomingEvents;
  } catch (err) {
    console.error('getEvents failed, returning static events only:', err);
    return initialEvents;
  }
};
