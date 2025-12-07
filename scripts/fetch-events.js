import fs from 'fs';
import axios from 'axios';
import { parseISO, isValid } from 'date-fns';

const EVENTS_FILE = './public/data/events.json';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200?text=Événement';

// Helper pour nettoyer texte et retirer balises HTML
function cleanText(text) {
  if (!text) return '';
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Normalisation d'un événement Haute-Garonne
function normalizeHauteGaronne(item) {
  if (!item.record?.fields) return null;
  const fields = item.record.fields;

  const name = cleanText(fields.title_fr || fields.title || '');
  const description = cleanText(fields.description_fr || fields.description || '');
  const location = cleanText(fields.location_name || fields.lieu || '');
  const dateStr = fields.firstdate_begin || fields.firstdate_end || '';
  const date = dateStr ? parseISO(dateStr) : null;
  const image = fields.image || fields.thumbnail || PLACEHOLDER_IMAGE;

  // 🚨 Correction Étape 1 : On ne valide que le nom et la date.
  if (!name || !date || !isValid(date)) return null;

  return {
    id: fields.uid || `${name}-${date.toISOString()}`,
    name,
    description,
    location,
    date: date.toISOString(),
    image,
    url: fields.canonicalurl || '',
  };
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

async function fetchHauteGaronneEvents() {
  try {
    const res = await axios.get(
      'https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records?limit=100'
    );

    const events = res.data.results
      .map(normalizeHauteGaronne)
      .filter(Boolean);
    
    // 🗓️ Correction Étape 2 : Filtrer les événements passés
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Référence à minuit

    const futureEvents = events.filter(ev => {
        const eventDate = new Date(ev.date);
        return eventDate >= today;
    });

    const deduped = deduplicate(futureEvents);

    // Tri par date
    deduped.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Écriture dans events.json
    fs.mkdirSync('./public/data', { recursive: true });
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(deduped, null, 2), 'utf-8');

    console.log(`✅ ${deduped.length} événements complets enregistrés dans ${EVENTS_FILE}`);
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des événements Haute-Garonne :', err);
  }
}

fetchHauteGaronneEvents();