'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

function normalizeApiResult(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.events)) return data.events;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  const firstArray = Object.values(data).find((v) => Array.isArray(v));
  return firstArray || [];
}

export default function AgendaToulousainPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      const sources = [
        '/api/agenda-trad-haute-garonne',
        '/api/agendaculturel',
        '/api/agendatoulousain',
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
      setFilteredEvents(merged);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }
    const query = searchQuery.toLowerCase();
    setFilteredEvents(events.filter(ev =>
      (ev.title?.toLowerCase().includes(query) ?? false) ||
      (ev.description?.toLowerCase().includes(query) ?? false) ||
      (ev.fullAddress?.toLowerCase().includes(query) ?? false) ||
      (ev.start?.toString().toLowerCase().includes(query) ?? false) ||
      ev.category.toLowerCase().includes(query)
    ));
  }, [searchQuery, events]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Agenda Toulousain</h1>
      <p className="text-muted-foreground mb-6">
        Événements agrégés depuis toutes les sources disponibles.
      </p>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, lieu, date ou catégorie..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Compteur */}
      <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

      {/* Mode d'affichage */}
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
          📺 Plein écran
        </Button>
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
          🔲 Vignette
        </Button>
      </div>

      {/* Bouton bleu Actualiser */}
      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun événement trouvé.</p>}

      {/* MODE CARTE */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[500px]">
              <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <Image src={ev.image || "/logo/default.png"} alt={ev.title} fill className="object-contain p-2" />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {new Date(ev.start).toLocaleString()}
                  </p>
                )}
                {ev.fullAddress && <p className="text-sm text-muted-foreground mb-2">📍 {ev.fullAddress}</p>}
                {ev.description && (
                  <div className="text-sm text-muted-foreground overflow-y-auto h-24 mb-2 pr-1">
                    {ev.description}
                  </div>
                )}
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-center"
                >
                  🔗 Plus d’infos
                </a>
                <p className="text-xs text-muted-foregrou
