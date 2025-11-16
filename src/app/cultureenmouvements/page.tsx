'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CultureEnMouvementsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/cultureenmouvements"); // ton route.ts iCal filtré Haute-Garonne
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setEvents(data);
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
      <h1 className="text-3xl font-bold mb-4">
        Événements Culture en Mouvements (Haute-Garonne - 31)
      </h1>
      <p className="text-muted-foreground mb-6">
        Récupération des événements via le flux iCal, filtrés sur le département 31.
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
        <p className="text-muted-foreground">
          Aucun événement trouvé en Haute-Garonne (31).
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-white shadow rounded overflow-hidden flex flex-col h-[360px]"
          >
            <div className="p-4 flex flex-col flex-1">
              {/* ✅ Titre */}
              <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>

              {/* ✅ Dates */}
              <p className="text-sm text-blue-600 font-medium mb-2">
                {new Date(ev.start).toLocaleString()} → {new Date(ev.end).toLocaleString()}
              </p>

              {/* ✅ Lieu */}
              {ev.location && (
                <p className="text-sm text-muted-foreground mb-2">
                  📍 {ev.location}
                </p>
              )}

              {/* ✅ Description */}
              {ev.description && (
                <div className="text-sm text-muted-foreground overflow-y-auto h-24 mb-2 pr-1">
                  {ev.description}
                </div>
              )}

              {/* ✅ Source */}
              <p className="text-xs text-muted-foreground mt-auto">
                Source : {ev.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
