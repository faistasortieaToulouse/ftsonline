"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  url: string | null;
  start: string | null;
  end: string | null;
  image: string;
  source: string;
};

const EventCard: React.FC<{ event: EventItem }> = ({ event }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[400px]">
    <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-lg font-bold mb-1">{event.title}</h3>
      {event.start && (
        <p className="text-sm text-blue-600 mb-1">
          {new Date(event.start).toLocaleString()} {event.end ? `→ ${new Date(event.end).toLocaleString()}` : ""}
        </p>
      )}
      {event.location && <p className="text-sm text-muted-foreground mb-1">📍 {event.location}</p>}
      {event.description && <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{event.description}</p>}
      {event.url && (
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-auto">
          🔗 Voir l’événement <ExternalLink className="w-4 h-4 inline ml-1" />
        </a>
      )}
      <p className="text-xs text-muted-foreground mt-2 italic">{event.source}</p>
    </div>
  </div>
);

export default function UT3MinPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ut3-min");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: EventItem[] = await res.json();
        setEvents(data);
        setFilteredEvents(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des événements.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filtrage multi-critères
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans antialiased">
      <header className="max-w-7xl mx-auto py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-xl shadow-lg gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Search className="w-7 h-7 text-indigo-600 mr-3" />
          Événements UT3 - Ciné / Conf / Expo
        </h1>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par titre, description, lieu ou date..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full sm:w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </header>

      {/* Compteur */}
      <p className="max-w-7xl mx-auto mt-4 text-sm text-gray-600">
        Événements affichés : {filteredEvents.length}
      </p>

      <main className="max-w-7xl mx-auto mt-6">
        {loading && (
          <div className="text-center p-10 bg-indigo-50 rounded-xl shadow-inner flex items-center justify-center text-indigo-600 text-lg font-medium">
            <Loader2 className="w-6 h-6 mr-3 animate-spin" /> Chargement des événements...
          </div>
        )}

        {error && (
          <div className="text-center p-10 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 mr-3" /> {error}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <p className="text-muted-foreground text-center mt-6">Aucun événement trouvé.</p>
        )}

        {!loading && filteredEvents.length > 0 && (
          viewMode === "card" ? (
            <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              {filteredEvents.map(ev => (
                <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-4 gap-4">
                  <img src={ev.image} alt={ev.title} className="w-full sm:w-48 h-32 object-cover flex-shrink-0 rounded" />
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                    {ev.start && <p className="text-sm text-blue-600 mb-1">{new Date(ev.start).toLocaleString()}</p>}
                    {ev.location && <p className="text-sm text-muted-foreground mb-1">{ev.location}</p>}
                    {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-3">{ev.description}</p>}
                    {ev.url && <a href={ev.url} target="_blank" className="text-blue-600 hover:underline mt-auto">Voir l’événement →</a>}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
