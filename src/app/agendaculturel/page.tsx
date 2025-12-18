'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/* -------------------------------------------------------------------------- */
/* Types                                    */
/* -------------------------------------------------------------------------- */

type AgendaEvent = {
  id: number;
  title: string;
  description?: string;
  start?: string;
  url?: string;
  category: string;
  image?: string;
  source: string;
  dateObj: Date;
};

/* -------------------------------------------------------------------------- */
/* Config / Utils                               */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Page                                    */
/* -------------------------------------------------------------------------- */

export default function AgendaCulturelPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agendaculturel');
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();

      const formatted = (data.items || []).map((it: any, idx: number) => ({
        id: idx,
        title: it.title,
        description: it.description,
        start: it.pubDate,
        url: it.link,
        category: it.category ?? 'Non spécifié',
        image: it.image,
        source: 'Agenda Culturel',
        dateObj: it.pubDate ? new Date(it.pubDate) : new Date(),
      }));

      formatted.sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
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
      (ev.start?.toLowerCase().includes(q) ?? false) ||
      ev.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Styles pour la barre de défilement fine */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <h1 className="text-3xl font-bold mb-4">Événements Agenda Culturel Toulouse</h1>
      
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? 'Chargement...' : '📡 Actualiser'}
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode('card')} variant={viewMode === 'card' ? 'default' : 'secondary'}>
            📺 Cartes
          </Button>
          <Button onClick={() => setViewMode('list')} variant={viewMode === 'list' ? 'default' : 'secondary'}>
            🔲 Liste
          </Button>
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
        />
      </div>

      <p className="mb-4 text-sm text-gray-500 font-medium tracking-tight">
        {filteredEvents.length} événements trouvés
      </p>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded-lg mb-6">{error}</div>}

      {/* ------------------------------ MODE CARD ----------------------------- */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[520px]">
              <img 
                src={getEventImage(ev.title, ev.category, ev.image)} 
                alt={ev.title} 
                className="w-full h-40 object-cover" 
              />

              <div className="p-4 flex flex-col flex-1">
                <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 w-fit">
                  {ev.category}
                </span>

                <h2 className="text-lg font-semibold mb-1 leading-tight line-clamp-2">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {formatDate(ev.start)}
                  </p>
                )}

                {/* Zone de description scrollable */}
                {ev.description && (
                  <div className="text-sm text-muted-foreground mb-4 flex-1 overflow-hidden">
                    <div className="h-24 overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
                      {ev.description}
                    </div>
                  </div>
                )}

                {ev.url && (
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 mb-2">
                    <a href={ev.url} target="_blank" rel="noopener noreferrer">
                      🔗 Voir l'événement
                    </a>
                  </Button>
                )}

                {/* Source formatée selon votre modèle Capitole */}
                <p className="text-xs text-muted-foreground mt-auto">
                  Source : {ev.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ------------------------------ MODE LIST ----------------------------- */
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-4 items-center">
              <img src={getEventImage(ev.title, ev.category, ev.image)} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />

              <div className="flex-1 flex flex-col w-full text-left">
                <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-1 w-fit">
                  {ev.category}
                </span>
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{ev.description}</p>

                <div className="mt-auto flex flex-wrap items-center gap-4">
                  {ev.url && (
                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4">
                      <a href={ev.url} target="_blank" rel="noopener noreferrer">Voir l'événement</a>
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Source : {ev.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}