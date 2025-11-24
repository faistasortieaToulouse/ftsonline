'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DemospherePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/demosphere");
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) {
        setError("Réponse invalide du serveur.");
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      setEvents(data);
      setFilteredEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtrage dynamique
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = events.filter(ev =>
      (ev.title?.toLowerCase().includes(query) ?? false) ||
      (ev.description?.toLowerCase().includes(query) ?? false) ||
      (ev.location?.toLowerCase().includes(query) ?? false) ||
      (ev.start?.toString().toLowerCase().includes(query) ?? false)
    );

    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Demosphere Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Récupération des événements via le flux iCal de Demosphere Toulouse.
      </p>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, lieu, date..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Compteur */}
      <p className="mb-4 font-semibold">
        Événements affichés : {filteredEvents.length}
      </p>

      {/* Mode d'affichage */}
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

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement trouvé.</p>
      )}

      {/* Mode carte */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[400px]">
              <div className="relative w-full h-24 bg-gray-100 flex items-center justify-center">
                <Image
                  src="/logo/demosphereoriginal.png"
                  alt="Logo Demosphere"
                  width={350}
                  height={90}
                  className="object-contain"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-2">
                  {new Date(ev.start).toLocaleString()} → {new Date(ev.end).toLocaleString()}
                </p>
                {ev.location && <p className="text-sm text-muted-foreground mb-2">📍 {ev.location}</p>}
                {ev.description && (
                  <div className="text-sm text-muted-foreground overflow-y-auto h-24 mb-2 pr-1">
                    {ev.description}
                  </div>
                )}

                {/* Bouton avec lien */}
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-center"
                >
                  🔗 Plus d’infos
                </a>

                <p className="text-xs text-muted-foreground mt-2">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode liste / vignette */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                <Image
                  src="/logo/demosphereoriginal.png"
                  alt="Logo Demosphere"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>
                <p className="text-sm text-blue-600">
                  {new Date(ev.start).toLocaleString()} → {new Date(ev.end).toLocaleString()}
                </p>
                {ev.location && <p className="text-sm text-muted-foreground">{ev.location}</p>}
                {ev.description && (
                  <div className="text-sm text-muted-foreground line-clamp-3">{ev.description}</div>
                )}

                {/* Bouton avec lien */}
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition text-sm w-max text-center"
                >
                  🔗 Plus d’infos
                </a>

                <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
