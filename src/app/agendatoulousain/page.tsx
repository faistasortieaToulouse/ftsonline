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

// Fonction universelle pour normaliser tous les formats d'API
function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;

  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  if (firstArray) return firstArray;

  return [];
}

export default function AgendaToulousainPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const sources = [
        '/api/agenda-trad-haute-garonne',
        '/api/agendaculturel',
        // tu pourras en ajouter d’autres ici
      ];

      const results = await Promise.all(
        sources.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            const json = await res.json();
            return normalizeApiResult(json);
          } catch (e) {
            console.error('Erreur API:', url, e);
            return [];
          }
        })
      );

      // Fusion et normalisation
      const merged = results.flat().map((it: any, idx: number) => ({
        id: it.id || it.link || idx,
        title: it.title || 'Événement',
        description: it.description || '',
        start: it.date || it.pubDate || null,
        url: it.url || it.link || '',
        category: it.category || 'Non spécifié',
        image: it.image || '',
        source: it.source || 'Inconnu',
        dateObj: it.date ? new Date(it.date) : it.pubDate ? new Date(it.pubDate) : new Date(),
        fullAddress: it.fullAddress || '',
      }));

      merged.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

      setEvents(merged);
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
      <h1 className="text-3xl font-bold mb-4">Agenda Toulousain</h1>
      <p className="text-muted-foreground mb-6">
        Événements agrégés depuis toutes les sources disponibles.
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
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun événement à afficher.</p>}

      {/* MODE CARD */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[510px]">
              <img src={getEventImage(ev.title, ev.category, ev.image)} alt={ev.title} className="w-full h-40 object-cover" />

              <div className="p-3 flex flex-col flex-1">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>

                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    {formatDate(ev.start)}
                  </p>
                )}

                {ev.description && (
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-4">
                    {ev.description}
                  </p>
                )}

                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline text-sm mb-1">
                    🔗 Plus d’informations
                  </a>
                )}

                {ev.fullAddress && (
                  <p className="text-xs text-muted-foreground mt-auto">{ev.fullAddress}</p>
                )}

                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODE LIST */
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3">
              <img src={getEventImage(ev.title, ev.category, ev.image)} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />

              <div className="flex-1 flex flex-col">
                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded mb-2">
                  {ev.category}
                </span>

                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    {formatDate(ev.start)}
                  </p>
                )}

                {ev.description && (
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-4">
                    {ev.description}
                  </p>
                )}

                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline text-sm mb-1">
                    🔗 Plus d’informations
                  </a>
                )}

                {ev.fullAddress && (
                  <p className="text-xs text-muted-foreground mt-auto">{ev.fullAddress}</p>
                )}

                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLEAU DES DATES */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">📋 Tableau des dates des évènements</h2>

        <table className="w-full border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Titre</th>
              <th className="border px-3 py-2 text-left">Catégorie</th>
              <th className="border px-3 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(ev => (
              <tr key={ev.id}>
                <td className="border px-3 py-2">{ev.title}</td>
                <td className="border px-3 py-2">{ev.category}</td>
                <td className="border px-3 py-2">{formatDate(ev.start)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
