'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

export default function AgendaToulousePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/agendatoulouse");
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();
      if (!data.events || data.events.length === 0) {
        setEvents([]);
        return;
      }
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Agenda Toulouse - Tous les événements</h1>
      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Recharger les événements"}
      </Button>

      {error && <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
        <strong>Erreur :</strong> {error}
      </div>}

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event, i) => (
            <div key={event.id || i} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <img
                src={event.image || event.coverImage || PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">{event.description}</p>
                <p className="text-sm font-medium mb-1">
                  {event.dateFormatted || event.date || event.start || ""}
                </p>
                <p className="text-sm text-muted-foreground mb-1">{event.fullAddress || event.location}</p>
                <p className="text-xs text-muted-foreground italic mb-3">Source : {event.source}</p>
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
          {loading ? "Chargement des événements..." : "Aucun événement à venir trouvé."}
        </p>
      )}
    </div>
  );
}
