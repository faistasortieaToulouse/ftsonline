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
import { fr } from 'date-fns';

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [frenchTechError, setFrenchTechError] = useState(false);
  const [openDataError, setOpenDataError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/events')
      .then(res => res.json())
      .then(fetchedEvents => {
        if (isMounted) {
          setEvents(fetchedEvents);

          // Vérification simple pour détecter si une source n’a rien renvoyé
          setFrenchTechError(!fetchedEvents.some(e => e.id.startsWith('french-tech')));
          setOpenDataError(!fetchedEvents.some(e => e.id.startsWith('opendata')));

          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch events from API route', err);
        if (isMounted) {
          setFrenchTechError(true);
          setOpenDataError(true);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const filteredEvents = useMemo(() => {
    const upcoming = events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (!searchTerm) return upcoming;

    const searchKeywords = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return upcoming.filter(event => {
      const formattedDate = format(new Date(event.date), 'PPP p', { locale: fr }).toLowerCase();
      const searchableText = [
        event.name.toLowerCase(),
        event.description.toLowerCase(),
        event.location.toLowerCase(),
        formattedDate,
      ].join(' ');

      return searchKeywords.every(keyword => searchableText.includes(keyword));
    });
  }, [events, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
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

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par titre, lieu, date, mot-clé..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">
            Chargement des événements...
          </h2>
          <p className="text-muted-foreground">
            Nous rassemblons les dernières sorties pour vous.
          </p>
        </div>
      ) : (
        <>
          {/* Message d'erreur spécifique pour les sources */}
          {(frenchTechError || openDataError) && (
            <div className="mb-6 p-4 rounded bg-yellow-100 text-yellow-900 border border-yellow-200">
              {frenchTechError && <p>⚠️ Impossible de récupérer les événements de La French Tech Toulouse.</p>}
              {openDataError && <p>⚠️ Impossible de récupérer les événements de Haute-Garonne OpenData.</p>}
            </div>
          )}

          {filteredEvents.length > 0 ? (
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
        </>
      )}
    </div>
  );
}
