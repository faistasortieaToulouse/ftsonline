"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

type TicketmasterEvent = {
  id: string;
  name: string;
  description?: string;
  date?: string;
  venue?: string;
  city?: string;
  url: string;
  image?: string;
};

export default function TicketmasterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/ticketmaster");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data.events || data.events.length === 0) {
        setEvents([]);
        return;
      }

      // Mapping et enrichissement
      const mapped = data.events.map((ev: any, index: number) => {
        const date = ev.date ? new Date(ev.date) : null;
        const dateFormatted = date
          ? date.toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date non précisée";

        const fullAddress = [ev.venue, ev.city].filter(Boolean).join(", ");

        return {
          id: ev.id || `${ev.name}-${index}`,
          name: ev.name,
          description: ev.description || "Pas de description disponible.",
          dateFormatted,
          image: ev.image || PLACEHOLDER_IMAGE,
          url: ev.url,
          fullAddress,
          source: "Ticketmaster",
        };
      });

      setEvents(mapped);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Évènements Ticketmaster en France</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les prochains événements disponibles via l’API Ticketmaster.
      </p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Rafraîchir"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.name}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">
                  {event.description}
                </p>
                <p className="text-sm font-medium mb-1">{event.dateFormatted}</p>
                <p className="text-sm text-muted-foreground mb-1">{event.fullAddress}</p>
                <p className="text-xs text-muted-foreground italic mb-3">
                  Source : {event.source}
                </p>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition"
                  >
                    🔗 Voir l’événement officiel
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">
          {loading ? "Chargement des événements..." : "Aucun événement trouvé."}
        </p>
      )}
    </div>
  );
}
