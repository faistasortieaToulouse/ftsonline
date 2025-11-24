"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  link: string;
  start: string | null;
  end: string | null;
  source: string;
};

const EventCard: React.FC<{ event: EventItem }> = ({ event }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
    <h3 className="text-xl font-bold text-indigo-700 mb-2">{event.title}</h3>
    <div className="flex items-center text-gray-600 mb-2">
      <Calendar className="w-4 h-4 mr-2 text-pink-500" />
      <span className="font-medium">
        {event.start ? new Date(event.start).toLocaleString("fr-FR") : "Date non spécifiée"}
      </span>
    </div>
    <div className="flex items-start text-gray-500 mb-4">
      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 mt-1" />
      <p>{event.location}</p>
    </div>
    {event.description && (
      <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
    )}
    <a
      href={event.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 hover:underline mt-2 inline-block"
    >
      Voir l'événement <ExternalLink className="w-4 h-4 inline ml-1" />
    </a>
  </div>
);

const App: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/toulousetourisme"); // <-- votre route.ts
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data: EventItem[] = await res.json();
        setEvents(data);
        setFilteredEvents(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des événements.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filtrage multi-critères : titre, description, location, date
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredEvents(
      events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          (ev.description?.toLowerCase().includes(q) ?? false) ||
          (ev.location?.toLowerCase().includes(q) ?? false) ||
          (ev.start?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [searchQuery, events]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans antialiased">
      <header className="max-w-7xl mx-auto py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center mb-4 sm:mb-0">
            <Search className="w-7 h-7 text-indigo-600 mr-3" />
            Événements à Toulouse
          </h1>

          {/* Barre de recherche */}
<input
  type="text"
  placeholder="Rechercher par titre, description, lieu ou date..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mt-4 sm:mt-0 w-full p-3 border rounded focus:outline-none focus:ring focus:border-indigo-300"
/>
        </div>

        {/* Compteur d'événements filtrés */}
        <p className="mt-4 text-sm text-gray-600">
          Événements affichés : {filteredEvents.length}
        </p>
      </header>

      <main className="max-w-7xl mx-auto mt-8">
        {loading && (
          <div className="text-center p-10 bg-indigo-50 rounded-xl shadow-inner flex items-center justify-center text-indigo-600 text-lg font-medium">
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Chargement des événements...
          </div>
        )}

        {error && (
          <div className="text-center p-10 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 mr-3" />
            {error}
          </div>
        )}

        <div className="grid gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
