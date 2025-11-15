'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './ui/button';
import Link from 'next/link';
import { Calendar, Map, Loader2, Search } from 'lucide-react';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x200?text=Événement';

// Nettoyage texte HTML
function cleanText(text?: string) {
  if (!text) return '';
  return text.replace(/<\/?[^>]+(>|$)/g, '').trim();
}

// Normalisation d'un événement Haute-Garonne
function normalizeHauteGaronne(item: any): Event | null {
  const fields = item.record?.fields || item.fields || item;

  const name = cleanText(fields.title_fr || fields.title || '⚠️ Titre manquant');
  const description = cleanText(fields.description_fr || fields.description || '⚠️ Description manquante');
  const location = cleanText(fields.location_name || fields.lieu || '⚠️ Lieu manquant');
  const dateStr = fields.firstdate_begin || fields.firstdate_end || '';
  const date = dateStr ? new Date(dateStr) : new Date();
  const image = fields.image || fields.thumbnail || PLACEHOLDER_IMAGE;

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

// Déduplication par ID
function deduplicate(events: Event[]): Event[] {
  const seen = new Set<string>();
  return events.filter(ev => {
    if (seen.has(ev.id)) return false;
    seen.add(ev.id);
    return true;
  });
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetching, setFetching] = useState(false);

  // Chargement initial depuis JSON local
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/data/events.json')
      .then(res => res.json())
      .then((localEvents: Event[]) => {
        if (isMounted) {
          console.log('Événements JSON locaux chargés:', localEvents.length);
          setEvents(localEvents);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Impossible de charger les événements locaux', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Bouton "Générer le tableau" : fusion JSON + API
  async function generateEvents() {
    setFetching(true);
    try {
      const res = await fetch(
        'https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records?limit=100'
      );
      const data = await res.json();

      console.log('Données brutes API Haute-Garonne:', data);

      const apiEvents = data.results
        .map(normalizeHauteGaronne)
        .filter((ev: Event | null): ev is Event => ev !== null);

      console.log('Événements API normalisés:', apiEvents.length);

      // Fusion avec les événements locaux et déduplication
      const merged = deduplicate([...events, ...apiEvents]);
      console.log('Événements fusionnés et dédupliqués:', merged.length);
      setEvents(merged);
    } catch (err) {
      console.error('Erreur lors de la génération des événements', err);
      alert('Erreur lors de la génération des événements. Vérifiez la console.');
    } finally {
      setFetching(false);
    }
  }

  const filteredEvents = useMemo(() => {
    const upcoming = events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (!searchTerm) return upcoming;

    const keywords = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return upcoming.filter(event => {
      const searchableText = [
        event.name.toLowerCase(),
        event.description.toLowerCase(),
        event.location.toLowerCase(),
        format(new Date(event.date), 'PPP p', { locale: frLocale }).toLowerCase(),
      ].join(' ');

      return keywords.every(k => searchableText.includes(k));
    });
  }, [events, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header + Boutons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
            Événements à venir
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez les événements passionnants en Haute-Garonne.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-shrink-0 gap-2">
          {/* Nouveau bouton vers Test API */}
          <Button asChild variant="outline">
            <Link href="/test-api">
              🧪 Tester API HG
            </Link>
          </Button>
          <Button onClick={generateEvents} disabled={fetching} variant="outline">
            {fetching ? 'Génération...' : '📊 Générer le tableau'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/calendar">
              <Calendar />
              Voir le calendrier
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/map">
              <Map />
              Voir la carte
            </Link>
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par titre, lieu, date, description, mot-clé..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contenu principal */}
      {loading && !fetching ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">
            Chargement des événements...
          </h2>
          <p className="text-muted-foreground">
            Nous rassemblons les dernières sorties pour vous.
          </p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-lg border-2 border-dashed bg-card">
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">
            Aucun événement trouvé
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? 'Essayez de modifier votre recherche.'
              : 'Revenez plus tard pour de nouveaux événements !'}
          </p>
        </div>
      )}
    </div>
  );
}
