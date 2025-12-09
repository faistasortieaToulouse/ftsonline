'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const CATEGORY_IMAGES: Record<string, string> = {
  'Concert': '/images/agenda31/agendconcert.jpg',
  'Théâtre': '/images/agenda31/agendtheatre.jpg',
  'Festival': '/images/agenda31/agendfestival.jpg',
  'Jeune public': '/images/agenda31/agendspectacleenfants.jpg',
  'Danse': '/images/agenda31/agenddanse.jpg',
  'Arts du spectacle': '/images/agenda31/agendartspectacle.jpg',
  'Exposition': '/images/agenda31/agendexpo.jpg',
  'Défaut': '/images/agenda31/agendgenerique.jpg',
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEventImage = (title?: string, category?: string, fallback: string = CATEGORY_IMAGES['Défaut']) => {
  if (category && CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category];
  if (!title) return fallback;

  const lower = title.toLowerCase();
  if (lower.includes('concert')) return CATEGORY_IMAGES['Concert'];
  if (lower.includes('théâtre') || lower.includes('theatre')) return CATEGORY_IMAGES['Théâtre'];
  if (lower.includes('festival')) return CATEGORY_IMAGES['Festival'];
  if (lower.includes('jeune') || lower.includes('enfant')) return CATEGORY_IMAGES['Jeune public'];
  if (lower.includes('danse')) return CATEGORY_IMAGES['Danse'];
  if (lower.includes('spectacle')) return CATEGORY_IMAGES['Arts du spectacle'];
  if (lower.includes('expo') || lower.includes('exposition')) return CATEGORY_IMAGES['Exposition'];

  return fallback;
};

export default function AgendaToulousainPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Récupération des événements depuis les deux API
  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const [tradRes, culturelRes] = await Promise.all([
        fetch('/api/agendatoulousain'),
        fetch('/api/agendaculturel'),
      ]);

      const tradData = await tradRes.json();
      const culturelData = await culturelRes.json();

      const formattedTrad = (tradData.events ?? []).map((ev: any, idx: number) => ({
        id: `trad-${idx}`,
        title: ev.title,
        description: ev.description,
        start: ev.dateFormatted || ev.start || null,
        url: ev.url,
        category: ev.category || 'Non spécifié',
        image: ev.image || CATEGORY_IMAGES['Défaut'],
        source: 'Agenda Trad',
      }));

      const formattedCulturel = (culturelData.items ?? []).map((it: any, idx: number) => ({
        id: `culturel-${idx}`,
        title: it.title,
        description: it.description,
        start: it.pubDate || null,
        url: it.link,
        category: it.category || 'Non spécifié',
        image: it.image || CATEGORY_IMAGES['Défaut'],
        source: 'Agenda Culturel',
      }));

      const allEvents = [...formattedTrad, ...formattedCulturel];
      allEvents.sort((a, b) => new Date(a.start || '').getTime() - new Date(b.start || '').getTime());

      setEvents(allEvents);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const startStr = ev.start ? formatDate(ev.start) : '';
    return (
      (ev.title?.toLowerCase().includes(q) ?? false) ||
      (ev.description?.toLowerCase().includes(q) ?? false) ||
      startStr.toLowerCase().includes(q) ||
      (ev.category?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Agenda Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Événements récupérés depuis Agenda Trad et Agenda Culturel.
      </p>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? 'Chargement...' : '📡 Actualiser'}
        </Button>
        <Button onClick={() => setViewMode('card')} variant={viewMode === 'card' ? 'default' : 'secondary'}>
          📺 Plein écran
        </Button>
        <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'default' : 'secondary'}>
          🔲 Vignette
        </Button>
        <input
          type="text"
          placeholder="Rechercher par titre, description, date ou catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Événements affichés : {filteredEvents.length}</p>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>}
      {!loading && filteredEvents.length === 0 && <p className="text-muted-foreground">Aucun événement à afficher.</p>}

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[510px]">
              <img
                src={getEventImage(ev.title, ev.category, ev.image)}
                alt={ev.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 flex flex-col flex-1">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>
                )}
                {ev.description && (
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>
                )}
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-center"
                  >
                    🔗 Plus d’infos
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-2">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="relative w-24 h-24 bg-gray-200 rounded overflow-hidden">
                <Image
                  src={getEventImage(ev.title, ev.category, ev.image)}
                  alt={ev.title}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>
                <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>
                {ev.start && <p className="text-sm text-blue-600">{formatDate(ev.start)}</p>}
                {ev.description && (
                  <div className="text-sm text-muted-foreground line-clamp-3">{ev.description}</div>
                )}
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition text-sm w-max text-center"
                  >
                    🔗 Plus d’infos
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
