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
    description: 'Un festival de musique annuel présentant des artistes locaux et internationaux. Un incontournable pour tous les amateurs de musique.',
    image: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: '2',
    name: 'Conférence Tech 2024',
    date: addDays(45),
    location: 'Centre de Congrès Pierre Baudis, Toulouse',
    description: "La plus grande conférence technologique de Haute-Garonne, couvrant l'IA, la blockchain et les technologies futures.",
    image: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
  {
    id: '3',
    name: 'Marché de Noël',
    date: addDays(120),
    location: 'Place du Capitole, Toulouse',
    description: "Le marché de Noël traditionnel. Trouvez des cadeaux uniques, dégustez du vin chaud et imprégnez-vous de l'atmosphère festive.",
    image: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  },
  {
    id: '4',
    name: 'Rassemblement Communautaire',
    date: addDays(30),
    location: 'Jardin des Plantes, Toulouse',
    description: 'Une journée de détente pour la communauté avec des jeux, de la nourriture et de la musique. Parfait pour les familles.',
    image: PlaceHolderImages[3].imageUrl,
    imageHint: PlaceHolderImages[3].imageHint,
  },
];

// --- Déduplication ---
const deduplicateEvents = (events: Event[]): Event[] => {
  const uniqueMap = new Map<string, Event>();
  events.forEach(event => {
    const key = `${event.name.toLowerCase().trim()}-${event.date.split('T')[0]}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, event);
  });
  return Array.from(uniqueMap.values());
};

// --- Parse RSS La French Tech Toulouse ---
const parseLaFrenchTechToulouse = async (): Promise<Event[]> => {
  try {
    const parser = new Parser();
    const response = await fetch('https://www.lafrenchtechtoulouse.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Node.js fetch)' }
    });
    console.log('[RSS] Status:', response.status);
    if (!response.ok) throw new Error('RSS fetch failed');

    const feedText = await response.text();
    const feed = await parser.parseString(feedText);
    console.log('[RSS] Items:', feed.items.length);

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
    console.error('[RSS] Failed to fetch or parse La French Tech Toulouse:', err);
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
    console.log('[OpenData] Records:', json.records.length);

    return json.records.map((r: any, index: number) => {
      const fields = r.fields;
      const randomImage = PlaceHolderImages[(index + 8) % PlaceHolderImages.length];
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
    console.error('[OpenData] Failed to fetch Haute-Garonne OpenData:', err);
    return [];
  }
};

// --- Fonction principale ---
export const getEvents = async (): Promise<Event[]> => {
  console.log('Fetching all events...');
  try {
    const initial = initialEvents;
    console.log('Initial events:', initial.length);

    const frenchTech = await parseLaFrenchTechToulouse();
    console.log('French Tech events:', frenchTech.length);

    const openData = await fetchOpenDataHauteGaronne();
    console.log('OpenData events:', openData.length);

    const allEvents = [...initial, ...frenchTech, ...openData];
    const uniqueEvents = deduplicateEvents(allEvents);

    const upcomingEvents = uniqueEvents
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Upcoming events:', upcomingEvents.length);
    return upcomingEvents;
  } catch (err) {
    console.error('Error in getEvents:', err);
    return initialEvents;
  }
};
