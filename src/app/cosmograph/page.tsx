'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const getEventImage = (title: string | undefined) => {
  if (!title) return "https://via.placeholder.com/400x200?text=Cosmograph";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cinema") || lower.includes("film")) return "https://via.placeholder.com/400x200?text=Ciné";
  return "https://via.placeholder.com/400x200?text=Cosmograph";
};

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CosmographPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cosmograph");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
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
      <h1 className="text-3xl font-bold mb-4">Événements American Cosmograph</h1>
      <p className="text-muted-foreground mb-6">
        Événements filtrés depuis le flux officiel d’American Cosmograph.
      </p>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
          📺 Plein écran
        </Button>
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
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

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[480px]">
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full h-40 object-cover" />
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
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />
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
