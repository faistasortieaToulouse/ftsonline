'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "/api/hautegaronne";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

export default function HauteGaronnePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Mode d'affichage : "card" = plein écran, "list" = vignette
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events || []);
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
      <h1 className="text-3xl font-bold mb-4">Événements Haute-Garonne</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les événements à venir dans les 31 prochains jours pour la Haute-Garonne.
      </p>

      {/* BOUTONS MODE PLEIN ÉCRAN / VIGNETTE */}
      <div className="flex gap-4 mb-6">
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

      {/* BOUTON ACTUALISER */}
      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser les événements"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* 🟥 Mode plein écran */}
      {viewMode === "card" && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[480px]">
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">{event.description}</p>
                <p className="text-sm font-medium mb-1">{event.dateFormatted}</p>
                <p className="text-sm text-muted-foreground mb-1">{event.fullAddress}</p>
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
      )}

      {/* 🟨 Mode vignette */}
      {viewMode === "list" && events.length > 0 && (
        <div className="space-y-4 mt-6">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs overflow-hidden">
                <img
                  src={event.image || PLACEHOLDER_IMAGE}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold line-clamp-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <p className="text-sm font-medium mt-1">{event.dateFormatted}</p>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm mt-1 block"
                  >
                    Voir →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="mt-6 text-muted-foreground">Aucun événement à venir trouvé.</p>
      )}
    </div>
  );
}
