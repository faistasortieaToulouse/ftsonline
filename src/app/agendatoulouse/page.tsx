'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

export default function AgendaToulousePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [search, setSearch] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Formattage des dates pour l'affichage
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long'
    });
  };

  function getCategory(event: any) {
    return (
      event.category ||
      event.type ||
      event.tags?.join(", ") ||
      detectCategory(event.title + " " + (event.description || ""))
    );
  }

  function detectCategory(text: string) {
    const t = text.toLowerCase();
    if (t.includes("concert")) return "Concert";
    if (t.includes("théâtre") || t.includes("theatre")) return "Théâtre";
    if (t.includes("exposition")) return "Exposition";
    if (t.includes("festival")) return "Festival";
    if (t.includes("salon")) return "Salon";
    if (t.includes("conférence")) return "Conférence";
    return "Autre";
  }

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agendatoulousain");
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
      const data = await res.json();
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }
    const q = search.toLowerCase();
    const result = events.filter((ev) => {
      const category = getCategory(ev);
      const combined = `${ev.title} ${ev.description} ${ev.fullAddress || ev.location} ${category}`.toLowerCase();
      return combined.includes(q);
    });
    setFilteredEvents(result);
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Agenda Toulouse – Tous les événements</h1>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre, lieu, catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          {filteredEvents.length} événement(s) trouvé(s)
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>📺 Plein écran</Button>
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>🔲 Vignette</Button>
          <Button onClick={fetchEvents} disabled={loading} variant="outline">
            {loading ? "..." : "📡 Actualiser"}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded mb-6">{error}</div>}

      {/* --- MODE CARD --- */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <div key={event.id || i} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[520px] border border-gray-100">
              <div className="relative h-56 w-full">
                <img
                  src={event.image || PLACEHOLDER_IMAGE}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Badge "En cours" pour les expos déjà commencées */}
                {event.isOngoing && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase">
                    🔥 Actuellement
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="text-xl font-semibold mb-2 line-clamp-2 overflow-y-auto max-h-14">
                  {event.title}
                </div>

                <div className="text-sm text-muted-foreground mb-2 flex-1 overflow-y-auto custom-scrollbar max-h-20 leading-relaxed">
                  {event.description}
                </div>

                {/* Affichage de la date adapté aux événements longs */}
                <div className="mb-2">
                  {event.isOngoing ? (
                    <p className="text-sm font-bold text-blue-600">
                      Jusqu'au {formatDate(event.endDate)}
                    </p>
                  ) : (
                    <p className="text-sm font-medium">
                      {event.dateFormatted || formatDate(event.date)}
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-1 truncate">
                  📍 {event.fullAddress || event.location}
                </p>

                <p className="text-xs text-muted-foreground italic mb-4">
                  {getCategory(event)} • Source : {event.source}
                </p>

                {/* Correction du bouton : accepte url OU link */}
                {(event.url || event.link) && (
                  <a
                    href={event.url || event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto block w-full bg-blue-600 text-white text-center py-2.5 rounded-md hover:bg-blue-700 transition font-bold text-sm shadow-sm"
                  >
                    🔗 Voir l’événement officiel
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODE LISTE --- */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((event, i) => (
            <div key={event.id || i} className="flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition">
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-blue-800 truncate">{event.title}</h3>
                  {event.isOngoing && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold">EN COURS</span>}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2 italic">
                  {event.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                   <span className="font-bold">
                     {event.isOngoing ? `Jusqu'au ${formatDate(event.endDate)}` : (event.dateFormatted || formatDate(event.date))}
                   </span>
                   <span>📍 {event.location}</span>
                   <span className="text-gray-400">Source : {event.source}</span>
                </div>

                {(event.url || event.link) && (
                  <a
                    href={event.url || event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-600 font-bold hover:underline"
                  >
                    Voir l’événement →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && !error && (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground italic">Aucun événement ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}