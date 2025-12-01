'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const categoryImages: Record<string, string> = {
  'Concert': '/images/agenda31/agendconcert.jpg',
  'Théâtre': '/images/agenda31/agendtheatre.jpg',
  'Festival': '/images/agenda31/agendfestival.jpg',
  'Jeune public': '/images/agenda31/agendspectacleenfants.jpg',
  'Danse': '/images/agenda31/agenddanse.jpg',
  'Arts du spectacle': '/images/agenda31/agendartspectacle.jpg',
  'Exposition': '/images/agenda31/agendexpo.jpg',
  'Défaut': '/images/agenda31/agendgenerique.jpg',
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

const getEventImage = (title: string | undefined, category: string | undefined, fallback: string = categoryImages['Défaut']) => {
  if (category && categoryImages[category]) return categoryImages[category];
  if (!title) return fallback;

  const lower = title.toLowerCase();
  if (lower.includes('concert')) return categoryImages['Concert'];
  if (lower.includes('théâtre')) return categoryImages['Théâtre'];
  if (lower.includes('festival')) return categoryImages['Festival'];
  if (lower.includes('jeune')) return categoryImages['Jeune public'];
  if (lower.includes('danse')) return categoryImages['Danse'];
  if (lower.includes('spectacle')) return categoryImages['Arts du spectacle'];
  if (lower.includes('exposition')) return categoryImages['Exposition'];

  return fallback;
};

export default function AgendaCulturelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agendaculturel');
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();

      const formatted = data.items.map((it: any, idx: number) => ({
        id: idx,
        title: it.title,
        description: it.description,
        start: it.pubDate,
        url: it.link,
        category: it.category ?? '',  // Si l'API renvoie une catégorie
        image: it.image, // image récupérée ou fallback côté API
        source: 'Agenda Culturel',
        dateObj: it.pubDate ? new Date(it.pubDate) : new Date(),
      }));

      // Tri chronologique
      formatted.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
      setEvents(formatted);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      (ev.description?.toLowerCase().includes(q) ?? false) ||
      (ev.start?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Agenda Culturel Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Événements filtrés depuis le flux officiel Agenda Culturel Toulouse.
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
          placeholder="Rechercher par titre, description ou date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Événements affichés : {filteredEvents.length}</p>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun événement à afficher.</p>}

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[480px]">
              <img src={getEventImage(ev.title, ev.category, ev.image)} alt={ev.title} className="w-full h-40 object-cover" />
              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.start && <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>}
                {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>}
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-1">
                    🔗 Plus d’informations
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3">
              <img src={getEventImage(ev.title, ev.category, ev.image)} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.start && <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>}
                {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>}
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-1">
                    🔗 Plus d’informations
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
