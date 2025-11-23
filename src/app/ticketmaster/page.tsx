'use client';

import React, { useState, useEffect } from "react";

type TicketmasterEvent = {
  id: string;
  name: string;
  date?: string;
  venue?: string;
  city?: string;
  url: string;
  description?: string;
  image?: string;
};

export default function TicketmasterPage() {
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Nouveau : mode d'affichage
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ticketmaster");
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setEvents([]);
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        setError("Impossible de charger les évènements Ticketmaster.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Évènements Ticketmaster en France</h1>

      {/* BOUTONS DE MODE */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          📺 Plein écran
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          🔲 Vignette
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <>
          {/* MODE PLEIN ÉCRAN (CARD) */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
                  {ev.image && (
                    <img src={ev.image} alt={ev.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">{ev.name}</h2>
                    {ev.date && <p className="text-sm text-blue-600">Date : {ev.date}</p>}
                    {ev.venue && <p className="text-sm text-muted-foreground">Lieu : {ev.venue}</p>}
                    {ev.city && <p className="text-sm text-muted-foreground">Ville : {ev.city}</p>}
                    {ev.description && (
                      <p className="text-sm text-muted-foreground line-clamp-4">{ev.description}</p>
                    )}
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 underline mt-1"
                    >
                      Voir sur Ticketmaster
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODE LISTE (VIGNETTE) */}
          {viewMode === "list" && (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm"
                >
                  {ev.image && (
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className="w-24 h-24 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-col flex-1">
                    <h2 className="text-lg font-semibold">{ev.name}</h2>
                    {ev.date && <p className="text-sm text-blue-600">Date : {ev.date}</p>}
                    {ev.venue && <p className="text-sm text-muted-foreground">Lieu : {ev.venue}</p>}
                    {ev.city && <p className="text-sm text-muted-foreground">Ville : {ev.city}</p>}
                    {ev.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{ev.description}</p>
                    )}
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 underline mt-1"
                    >
                      Voir sur Ticketmaster
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
