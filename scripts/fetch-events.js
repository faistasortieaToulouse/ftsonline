// scripts/fetch-events.js
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import fetch from 'node-fetch';

const PlaceHolderImages = [
  { imageUrl: '/images/placeholder1.jpg', imageHint: 'Placeholder 1' },
  { imageUrl: '/images/placeholder2.jpg', imageHint: 'Placeholder 2' },
  // ajoute tous tes placeholders ici
];

const initialEvents = [
  // tes events statiques ici
];

const deduplicateEvents = (events) => {
  const map = new Map();
  events.forEach(e => {
    const key = `${e.name.toLowerCase().trim()}-${e.date.split('T')[0]}`;
    if (!map.has(key)) map.set(key, e);
  });
  return Array.from(map.values());
};

// --- Fetch RSS La French Tech Toulouse ---
const fetchFrenchTech = async () => {
  try {
    const parser = new Parser();
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.lafrenchtechtoulouse.com/feed/')}`;
    const res = await fetch(proxyUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error('RSS fetch failed');
    const text = await res.text();
    const feed = await parser.parseString(text);

    return feed.items.map((item, i) => {
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];
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
    console.error('French Tech fetch failed', err);
    return [];
  }
};

// --- Fetch OpenData Haute-Garonne ---
const fetchOpenData = async () => {
  try {
    const url = 'https://data.haute-garonne.fr/api/records/1.0/search/?dataset=evenements-publics&rows=50';
    const res = await fetch(url);
    if (!res.ok) throw new Error('OpenData fetch failed');
    const json = await res.json();

    if (!json.records) return [];

    return json.records.map((r, i) => {
      const f = r.fields || {};
      const randomImage = PlaceHolderImages[i % PlaceHolderImages.length];
      return {
        id: f.uid || `opendata-${i}`,
        name: f.title || f.nom || 'Événement sans titre',
        date: f.date_start || new Date().toISOString(),
        location: f.venue_name || f.lieu || 'Lieu à définir',
        description: f.description || 'Pas de description.',
        image: randomImage.imageUrl,
        imageHint: randomImage.imageHint,
      };
    });
  } catch (err) {
    console.error('OpenData fetch failed', err);
    return [];
  }
};

const main = async () => {
  const [frenchTech, openData] = await Promise.all([fetchFrenchTech(), fetchOpenData()]);
  const allEvents = [...initialEvents, ...frenchTech, ...openData];
  const uniqueEvents = deduplicateEvents(allEvents);

  const filePath = path.resolve('src/data/events.json');
  fs.writeFileSync(filePath, JSON.stringify(uniqueEvents, null, 2));
  console.log(`Saved ${uniqueEvents.length} events to ${filePath}`);
};

main();
