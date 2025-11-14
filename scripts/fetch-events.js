import fs from 'fs';
import axios from 'axios';
import Parser from 'rss-parser';
import { parseISO, isValid } from 'date-fns';

const EVENTS_FILE = './events.json';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200?text=Événement';

// Helper pour nettoyer texte et retirer balises HTML
function cleanText(text) {
  if (!text) return '';
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Normalisation d'un événement
function normalizeEvent(raw) {
  const name = cleanText(raw.title || raw.name || '');
  const description = cleanText(raw.description || '');
  const location = cleanText(raw.location || raw.address || '');
  const date = raw.date ? parseISO(raw.date) : null;
  const image = raw.image || PLACEHOLDER_IMAGE;

  // Filtrage strict : on ne garde que les événements complets
  if (!name || !description || !location || !date || !isValid(date)) {
    return null;
  }

  return {
    id: raw.id || `${name}-${date.toISOString()}`,
    name,
    description,
    location,
    date: date.toISOString(),
    image,
  };
}

// Fetch RSS French Tech
async function fetchFrenchTech() {
  const parser = new Parser();
  const feed = await parser.parseURL('https://frenchtech.example.com/events.rss');
  return feed.items.map(item => normalizeEvent(item)).filter(Boolean);
}

// Fetch API Toulouse Métropole
async function fetchToulouseMetropole() {
  const res = await axios.get('https://data.toulouse-metropole.fr/api/events');
  return res.data.map(item => normalizeEvent(item)).filter(Boolean);
}

// Fetch API Haute-Garonne
async function fetchHauteGaronne() {
  const res = await axios.get('https://data.haute-garonne.fr/api/events');
  return res.data.map(item => normalizeEvent(item)).filter(Boolean);
}

// Déduplication par nom + date
function deduplicate(events) {
  const seen = new Set();
  return events.filter(ev => {
    const key = `${ev.name}-${ev.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const eventsFT = await fetchFrenchTech();
  const eventsTM = await fetchToulouseMetropole();
  const eventsHG = await fetchHauteGaronne();

  const allEvents = [...eventsFT, ...eventsTM, ...eventsHG];
  const deduped = deduplicate(allEvents);

  // Trier par date
  deduped.sort((a, b) => new Date(a.date) - new Date(b.date));

  fs.writeFileSync(EVENTS_FILE, JSON.stringify(deduped, null, 2));
  console.log(`✅ ${deduped.length} événements complets enregistrés dans ${EVENTS_FILE}`);
}

main().catch(err => console.error(err));
