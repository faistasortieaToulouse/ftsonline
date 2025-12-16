'use client';

import React, { useState, useEffect } from 'react';

const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return 'Date non spécifiée';
  const date = new Date(isoDate);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  creator: string;
  category: string;
}

interface ApiResponse {
  title: string;
  description: string;
  source: string;
  items: RssItem[];
}

interface EventItem extends RssItem {
  id: number;
  url: string;
}

export default function JeuPlateauPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const categories = ['Tous', 'Actualites', 'Critiques', 'Videos'];

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jeuplateau');
      if (!res.ok) throw new Error('Erreur API');

      const data: ApiResponse = await res.json();

      setEvents(
        data.items.map((it, idx) => ({
          ...it,
          id: idx,
          url: it.link,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const categoryMatch =
      filterCategory === 'Tous' || ev.category === filterCategory;

    if (!searchQuery) return categoryMatch;

    const q = searchQuery.toLowerCase();
    return (
      categoryMatch &&
      (ev.title.toLowerCase().includes(q) ||
        ev.snippet.toLowerCase().includes(q) ||
        ev.creator.toLowerCase().includes(q))
    );
  });

  const Button = ({ children, onClick, variant = 'default' }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded text-white text-sm ${
        variant === 'default'
          ? 'bg-indigo-600 hover:bg-indigo-700'
          : 'bg-gray-400 hover:bg-gray-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">
        📰 Jeux de Plateau – JeuxOnline
      </h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={fetchEvents}>
          {loading ? 'Chargement…' : 'Actualiser'}
        </Button>
        <Button onClick={() => setViewMode('card')}>Vignettes</Button>
        <Button onClick={() => setViewMode('list')}>Liste</Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </Button>
        ))}
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Recherche…"
          className="border p-2 rounded flex-1 min-w-[200px]"
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <p className="text-sm mb-4">
        Articles affichés : {filteredEvents.length}
      </p>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => (
            <a
              key={ev.id}
              href={ev.url}
              target="_blank"
              className="bg-white shadow rounded p-4 block"
            >
              <span className="text-xs font-semibold">
                {ev.category}
              </span>
              <h2 className="font-semibold text-lg">
                {ev.title}
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(ev.pubDate)}
              </p>
              <p className="text-sm mt-2">{ev.snippet}</p>
              <p className="text-xs mt-2">
                Auteur : {ev.creator}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((ev) => (
            <a
              key={ev.id}
              href={ev.url}
              target="_blank"
              className="bg-white shadow rounded p-4"
            >
              <h2 className="font-semibold text-lg">
                {ev.title}
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(ev.pubDate)}
              </p>
              <p className="text-sm mt-2">{ev.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
