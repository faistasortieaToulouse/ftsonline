'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function UT3RSSPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card"); // Nouveau

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/ut3-rss");
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
      <h1 className="text-3xl font-bold mb-4">Actualités UT3 - Flux RSS</h1>
      <p className="text-muted-foreground mb-6">
        Récupération des actualités depuis le flux RSS officiel de l’Université Toulouse III.
      </p>

      {/* Boutons d'action et mode */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button
          onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}
        >
          📺 Plein écran
        </Button>
        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}
        >
          🔲 Vignette
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucune actualité trouvée.</p>
      )}

      {/* Affichage des événements */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <div
              key={ev.id}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[360px]"
            >
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.date && (
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    {new Date(ev.date).toLocaleString()}
                  </p>
                )}
                {ev.description && (
                  <div className="text-sm text-muted-foreground overflow-y-auto h-24 mb-2 pr-1">
                    {ev.description}
                  </div>
                )}
                {ev.url && (
                  <p className="text-sm mb-2">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 Lire l’article complet
                    </a>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-auto">
                  Source : {ev.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-4 gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                {ev.date && (
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    {new Date(ev.date).toLocaleString()}
                  </p>
                )}
                {ev.description && (
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>
                )}
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    🔗 Lire l’article complet
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
