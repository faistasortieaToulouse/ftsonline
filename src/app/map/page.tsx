'use client';

import { useEffect, useState } from 'react';
import type { Event } from '@/lib/types';
import Parser from 'rss-parser';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// ⛔ IMPORTANT : on ne charge PAS Leaflet ici

// On charge la carte uniquement côté client
const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
});

export default function MapPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parser = new Parser();

    async function fetchEvents() {
      try {
        const res = await fetch('https://www.lafrenchtechtoulouse.com/feed/');
        const text = await res.text();
        const feed = await parser.parseString(text);

        const mappedEvents: Event[] = feed.items.map((item, i) => ({
          id: item.guid || item.link || `ft-${i}`,
          name: item.title || 'Événement sans titre',
          date: item.isoDate || new Date().toISOString(),
          location: 'Lieu à définir',
          description: item.contentSnippet || item.content || 'Pas de description.',
          image: '',
          imageHint: '',
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Erreur récupération flux RSS :', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-6">
            Carte des événements
          </h1>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full h-[70vh] overflow-hidden">
            {loading ? (
              <p className="text-center text-muted-foreground mt-8">
                Chargement des événements...
              </p>
            ) : events.length === 0 ? (
              <p className="text-center text-muted-foreground mt-8">
                Aucun événement trouvé.
              </p>
            ) : (
              <EventMap events={events} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
