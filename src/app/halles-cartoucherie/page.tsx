'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const MAX_EVENTS = 50;

export default function HallesCartoucheriePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/halles-cartoucherie");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data || !Array.isArray(data)) {
        setEvents([]);
        return;
      }

      const unique = new Map<string, any>();
      data.forEach(ev => {
        const key = ev.id || `${ev.title}-${ev.url || ""}`;
        if (!unique.has(key)) unique.set(key, ev);
      });

      setEvents(Array.from(unique.values()).slice(0, MAX_EVENTS));
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
      <h1 className="text-3xl font-bold mb-4">Agenda - Halles de la Cartoucherie</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les prochains événements des Halles de la Cartoucherie.
      </p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement à venir.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-white shadow rounded overflow-hidden flex flex-col h-[480px]"
          >
            {ev.image && (
              <img
                src={ev.image}
                alt={ev.title || "Événement"}
                className="w-full aspect-[16/9] object-cover"
              />
            )}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-semibold mb-1">{ev.title || "Événement"}</h2>

              {ev.dateFormatted && (
                <p className="text-sm font-medium mb-2">{ev.dateFormatted}</p>
              )}

              <p className="text-sm text-muted-foreground mb-2">
                Source : {ev.source || "Halles de la Cartoucherie"}
              </p>

              {ev.url && (
                <p className="text-sm mb-2">
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🔗 Voir l’événement officiel
                  </a>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
