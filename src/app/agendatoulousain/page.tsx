'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const categoryImages: Record<string, string> = {
  Bal: '/images/agendatrad/default-bal.jpg',
  'Bal folk': '/images/agendatrad/default-balfolk.jpg',
  'Fest-noz': '/images/agendatrad/default-festnoz.jpg',
  Baleti: '/images/agendatrad/default-baleti.jpg',
  Concert: '/images/agendatrad/default-concert.jpg',
  Stage: '/images/agendatrad/default-stage.jpg',
  'Stage de danse': '/images/agendatrad/default-stagedanse.jpg',
  'Stage de musique / chant': '/images/agendatrad/default-stagechant.jpg',
  Atelier: '/images/agendatrad/default-atelier.jpg',
  'Cours réguliers': '/images/agendatrad/default-cours.jpg',
  'Ateliers réguliers': '/images/agendatrad/default-atelier.jpg',
  Festival: '/images/agendatrad/default-festival.jpg',
  Session: '/images/agendatrad/default-session.jpg',
  Autre: '/images/agendatrad/default-generique.jpg',
  Danse: '/images/agendatrad/default-danse.jpg',
};

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getEventImage = (title?: string, category?: string, fallback: string = categoryImages['Danse']) => {
  if (category && categoryImages[category]) return categoryImages[category];
  if (!title) return fallback;

  const lower = title.toLowerCase();
  if (lower.includes('bal folk')) return categoryImages['Bal folk'];
  if (lower.includes('bal')) return categoryImages['Bal'];
  if (lower.includes('fest-noz')) return categoryImages['Fest-noz'];
  if (lower.includes('concert')) return categoryImages['Concert'];
  if (lower.includes('stage')) return categoryImages['Stage'];
  if (lower.includes('atelier')) return categoryImages['Atelier'];
  if (lower.includes('cours')) return categoryImages['Cours réguliers'];
  if (lower.includes('festival')) return categoryImages['Festival'];
  if (lower.includes('session')) return categoryImages['Session'];
  if (lower.includes('danse')) return categoryImages['Danse'];

  return fallback;
};

export default function AgendaToulousainPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agendatoulousain');
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError('Réponse invalide du serveur.');
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      const formatted = data.map((it: any, idx: number) => ({
        id: idx,
        title: it.title,
        description: it.description,
        start: it.date || it.dateFormatted || null,
        url: it.url,
        category: it.category || 'Danse',
        image: it.image || '',
        source: 'Agenda Toulousain',
        dateObj: it.date ? new Date(it.date) : new Date(),
      }));

      formatted.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
      setEvents(formatted);
      setFilteredEvents(formatted);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(query) ||
        (ev.description?.toLowerCase().includes(query) ?? false) ||
        (ev.start?.toLowerCase().includes(query) ?? false) ||
        ev.category.toLowerCase().includes(query)
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Agenda Toulousain</h1>
      <p className="text-muted-foreground mb-6">
        Événements filtrés depuis le flux officiel Agenda Toulousain.
      </p>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, date ou catégorie..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Compteur */}
      <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

      {/* Mode d'affichage */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setViewMode('card')}
          variant={viewMode === 'card' ? 'default' : 'secondary'}
        >
          📺 Plein écran
        </Button>
        <Button
          onClick={() => setViewMode('list')}
          variant={viewMode === 'list' ? 'default' : 'secondary'}
        >
          🔲 Vignette
        </Button>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? 'Chargement...' : '📡 Actualiser'}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement trouvé.</p>
      )}

      {/* Mode carte */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[500px]">
              <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <Image src={ev.image || '/images/agendatrad/default-danse.jpg'} alt={ev.title} fill className="object-cover" />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>

                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>
                )}

                {ev.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-4">{ev.description}</p>
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
      )}

      {/* Mode liste / vignette */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="flex gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="relative w-24 h-24 bg-gray-200 rounded overflow-hidden">
                <Image src={ev.image || '/images/agendatrad/default-danse.jpg'} alt={ev.title} fill className="object-cover" />
              </div>

              <div className="flex-1 flex flex-col">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>

                <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 mb-1">{formatDate(ev.start)}</p>
                )}

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
