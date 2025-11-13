'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Event } from '@/lib/types';
import Parser from 'rss-parser';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Fix problème des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
          location: 'Lieu à définir', // le RSS n’indique pas toujours la localisation exacte
          description: item.contentSnippet || item.content || 'Pas de description.',
          image: '', // optionnel
          imageHint: '', // optionnel
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

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full h-[70vh]">
            {loading ? (
              <p className="text-center text-muted-foreground mt-8">
                Chargement des événements...
              </p>
            ) : events.length === 0 ? (
              <p className="text-center text-muted-foreground mt-8">
                Aucun événement trouvé.
              </p>
            ) : (
              <MapContainer
                center={[43.6045, 1.444]} // Toulouse
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {events.map((event) => (
                  <Marker
                    key={event.id}
                    position={[43.6045, 1.444]} // TODO: remplacer par lat/lng si disponibles
                  >
                    <Popup>
                      <strong>{event.name}</strong>
                      <p>{event.location}</p>
                      <p>{new Date(event.date).toLocaleString()}</p>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
