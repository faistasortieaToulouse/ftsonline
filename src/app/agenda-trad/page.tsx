'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";

const MAX_EVENTS = 50;
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

export default function AgendaTradHauteGaronnePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState(""); // Barre de recherche

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/agenda-trad-haute-garonne");
      if (!res.ok)
        throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data || !Array.isArray(data)) {
        setEvents([]);
        return;
      }

      const uniqueEventsMap = new Map<string, any>();
      data.forEach((ev) => {
        const key = `${ev.title}-${ev.date}`;
        if (!uniqueEventsMap.has(key)) uniqueEventsMap.set(key, ev);
      });

      const uniqueEvents = Array.from(uniqueEventsMap.values())
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .slice(0, MAX_EVENTS);

      setEvents(uniqueEvents);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtrage des événements selon la recherche
  const filteredEvents = events.filter((ev) => {
    const search = searchTerm.toLowerCase();
    const dateStr = ev.dateFormatted?.toLowerCase() || "";
    const categoryStr = ev.category?.toLowerCase() || "";
    const locationStr = ev.fullAddress?.toLowerCase() || "";
    const titleStr = ev.title?.toLowerCase() || "";
    const descriptionStr = ev.description ? ev.description.toLowerCase() : "";

    return (
      titleStr.includes(search) ||
      descriptionStr.includes(search) ||
      categoryStr.includes(search) ||
      dateStr.includes(search) ||
      locationStr.includes(search)
    );
  });

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">
        AgendaTrad – Haute-Garonne
      </h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les prochains événements de la Haute-Garonne.
      </p>

      {/* Barre de recherche et compteur */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input
          type="text"
          placeholder="Rechercher par titre, description, catégorie, date ou lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <p className="text-sm text-gray-600 mt-2 sm:mt-0">
          {filteredEvents.length} événements trouvés
        </p>
      </div>

      {/* 🔘 Boutons Plein écran / Vignette */}
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
        <p className="text-muted-foreground">Aucun événement à venir.</p>
      )}

      {/* ========================================================== */}
      {/* 🟥 MODE PLEIN ÉCRAN (CARD) */}
      {/* ========================================================== */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[520px]"
            >
              <img
                src={ev.image || PLACEHOLDER_IMAGE}
                alt={ev.title}
                className="w-full aspect-[16/9] object-cover"
              />

              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-2">
                  {ev.category}
                </p>

                {ev.fullAddress && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {ev.fullAddress}
                  </p>
                )}

                <p className="text-sm font-medium mb-2">{ev.dateFormatted}</p>

                <p className="text-sm text-muted-foreground mb-2">
                  Source : AgendaTrad
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

                {ev.description && (
                  <div className="text-sm text-muted-foreground overflow-y-auto h-48 mb-2 pr-1 scrollable">
                    {parse(ev.description)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================== */}
      {/* 🟨 MODE LISTE (VIGNETTE) */}
      {/* ========================================================== */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm"
            >
              <img
                src={ev.image || PLACEHOLDER_IMAGE}
                alt={ev.title}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />

              <div className="flex flex-col flex-1">
                <h2 className="text-lg font-semibold line-clamp-2">
                  {ev.title}
                </h2>

                <p className="text-sm font-medium text-blue-600">
                  {ev.category}
                </p>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ev.fullAddress}
                </p>

                <p className="text-sm">{ev.dateFormatted}</p>

                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    className="mt-1 text-blue-600 underline"
                  >
                    Voir →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
