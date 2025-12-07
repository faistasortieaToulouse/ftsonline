import type { Event } from './types';

export const PLACEHOLDER_IMAGE = '/images/placeholders.jpg';  // <-- export ajouté

// Filtrage sur today + 31 jours
const filterNext31Days = (events: Event[]) => {
  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + 31);

  return events.filter(ev => {
    const d = new Date(ev.date);
    return d >= now && d <= limit;
  });
};

export const fetchAgendaToulouse = async (): Promise<Event[]> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agendatoulouse`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Erreur fetch Agenda Toulouse');

    const data = await res.json();
    if (!data.events || !Array.isArray(data.events)) return [];

    const events: Event[] = data.events.map((ev: any) => ({
      id: ev.id,
      name: ev.title || 'Événement',
      description: ev.description || '',
      location: ev.location || '',
      date: ev.date || new Date().toISOString(),
      image: ev.image || PLACEHOLDER_IMAGE,  // <-- toujours utilisable ici
      url: ev.url || '',
    }));

    return filterNext31Days(events);
  } catch (err) {
    console.error('fetchAgendaToulouse failed:', err);
    return [];
  }
};
