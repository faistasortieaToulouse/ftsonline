'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Retourne l'image en fonction du titre
const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capicine.jpg";
  if (lower.includes("conf")) return "/images/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capiexpo.jpg";
  return "/images/capidefaut.jpg";
};

// Formatage de la date en texte lisible
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Date non précisée";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  } catch {
    return dateStr;
  }
};

export default function CapitoleMinPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/capitole-min");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage dynamique
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredEvents(
      events.filter(ev =>
        ev.title.toLowerCase().includes(q) ||
        (ev.description?.toLowerCase().includes(q) ?? false) ||
        (ev.location?.toLowerCase().includes(q) ?? false) ||
        (ev.start?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [searchQuery, events]);

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Événements UT Capitole – Ciné, Conf & Expo</h1>
      <p className="text-muted-foreground mb-4 text-sm">
        Événements filtrés depuis le flux officiel de l’Université Toulouse Capitole.
      </p>

      {/* Boutons et recherche */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
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
          placeholder="Rechercher par titre, description, lieu ou date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2 sm:mt-0 w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-2 text-sm text-gray-600">Événements affichés : {filteredEvents.length}</p>
      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-400 rounded mb-4">{error}</div>}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun événement trouvé.</p>}

      {/* Affichage des events */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[450px]">
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full h-40 object-cover" />
              <div className="p-3 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                  {ev.start && (
                    <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>
                  )}
                  {ev.location && <p className="text-sm text-muted-foreground mb-1">📍 {ev.location}</p>}
                  {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-3">{ev.description}</p>}
                </div>
                <div>
                  {ev.url && (
                    <p className="text-sm mb-1">
                      <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        🔗 Plus d’informations
                      </a>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3">
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full sm:w-40 h-32 object-cover rounded" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                  {ev.start && <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.start)}</p>}
                  {ev.location && <p className="text-sm text-muted-foreground mb-1">📍 {ev.location}</p>}
                  {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-3">{ev.description}</p>}
                </div>
                <div>
                  {ev.url && (
                    <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      🔗 Plus d’informations
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
