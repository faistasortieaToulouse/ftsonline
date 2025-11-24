'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Configuration pour le format de date français
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export default function CultureEnMouvementsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // 🟦 Mode d'affichage : "card" = plein écran, "list" = vignette
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/cultureenmouvements");
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`API HTTP error: ${res.status} ${res.statusText} - ${errorBody.error || 'Erreur non détaillée'}`);
      }
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la récupération des événements.");
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
        Récupération des événements du site officiel, filtrés sur le département 31.
      </p>

      {/* 🔘 Boutons pour changer le mode d'affichage */}
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

      <Button onClick={fetchEvents} disabled={loading} className="mb-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition duration-200">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-600 rounded mb-6 font-mono text-sm">
          Erreur: {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-gray-500 italic">
          Aucun événement trouvé en Haute-Garonne (31) ou l'API n'a pas encore renvoyé de données.
        </p>
      )}

      {/* ============================================ */}
      {/* 🟥 Mode Plein écran */}
      {/* ============================================ */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <div
              key={ev.id}
              className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col transition duration-300 hover:shadow-2xl border border-gray-100"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={ev.image.startsWith('/') ? `https://www.cultureenmouvements.org${ev.image}` : ev.image} 
                  alt={`Illustration pour ${ev.title}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = 'https://placehold.co/600x400/94A3B8/FFFFFF?text=Culture+en+Mouvements'; 
                  }}
                />
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-bold mb-1 text-gray-800 line-clamp-2">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-indigo-600 font-semibold mb-2 flex items-center">
                    {new Date(ev.start).toLocaleDateString('fr-FR', dateFormatOptions)}
                  </p>
                )}

                {ev.location && (
                  <p className="text-sm text-gray-600 mb-2 flex items-center">{ev.location}</p>
                )}

                {ev.link && (
                  <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700 mt-auto pt-2 transition duration-200 font-medium flex items-center">
                    Voir les détails
                  </a>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  Source : {ev.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* 🟨 Mode Vignette */}
      {/* ============================================ */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev.id} className="flex gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                <img 
                  src={ev.image.startsWith('/') ? `https://www.cultureenmouvements.org${ev.image}` : ev.image} 
                  alt={`Illustration pour ${ev.title}`}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => { 
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; 
                    target.src = 'https://placehold.co/96x96/94A3B8/FFFFFF?text=Culture'; 
                  }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>
                {ev.start && (
                  <p className="text-sm text-indigo-600">
                    {new Date(ev.start).toLocaleDateString('fr-FR', dateFormatOptions)}
                  </p>
                )}
                {ev.location && (
                  <p className="text-sm text-gray-600">{ev.location}</p>
                )}
                {ev.link && (
                  <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700 mt-1 block">
                    Voir les détails
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-1">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
