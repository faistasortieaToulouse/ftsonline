'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function UT3AgendaPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/ut3-agenda");
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
      <h1 className="text-3xl font-bold mb-4">Agenda UT3 - Paul Sabatier</h1>
      <p className="text-muted-foreground mb-6">
        Événements récupérés depuis le flux iCal officiel.
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
        <p className="text-muted-foreground">Aucun événement trouvé.</p>
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
                <p className="text-sm text-muted-foreground mb-2">📍 {ev.location}</p>
              )}

              {/* ✅ Description */}
              {ev.description && (
                <div className="text-sm text-muted-foreground overflow-y-auto h-24 mb-2 pr-1 scrollable">
                  {ev.description}
                </div>
              )}

              {/* ✅ Lien éventuel */}
              {ev.url && (
                <p className="text-sm mb-2">
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🔗 Plus d’informations
                  </a>
                </p>
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
