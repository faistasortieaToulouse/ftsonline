'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x200?text=Événement";

export default function AgendaToulousePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [search, setSearch] = useState("");

  /** ─────────────────────────────────────────────
   *  Catégorie + sécurité sur les champs
   *  ─────────────────────────────────────────────
   */
  function getCategory(event: any) {
    return (
      event.category ||
      event.type ||
      event.tags?.join(", ") ||
      detectCategory((event.title || "") + " " + (event.description || ""))
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

  /** ─────────────────────────────────────────────
   *  Fetch principal → /api/agendatoulouse
   *  ─────────────────────────────────────────────
   */
  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/agendatoulouse");

      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);

      const data = await res.json();

      const evts = data.events || [];
      setEvents(evts);
      setFilteredEvents(evts);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  /** ─────────────────────────────────────────────
   *  Filtrage intelligent
   *  ─────────────────────────────────────────────
   */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }

    const q = search.toLowerCase();

    const result = events.filter((ev) => {
      const category = getCategory(ev);

      const combined = `
        ${ev.title || ""}
        ${ev.description || ""}
        ${ev.fullAddress || ev.location || ""}
        ${ev.dateFormatted || ev.date || ""}
        ${category}
      `.toLowerCase();

      return combined.includes(q);
    });

    setFilteredEvents(result);
  }, [search, events]);

  /** ─────────────────────────────────────────────
   *  Rendu
   *  ─────────────────────────────────────────────
   */
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">
        Agenda Toulouse – Tous les événements
      </h1>

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par titre, lieu, date, description, catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Compteur */}
      <p className="text-muted-foreground mb-4">
        {filteredEvents.length} événement(s) trouvé(s)
      </p>

      {/* Modes d'affichage */}
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

      {/* Bouton Refresh */}
      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Recharger les événements"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* MODE CARTE (plein écran) */}
      {viewMode === "card" && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredEvents.map((event, i) => (
            <div
              key={event.id || i}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[520px]"
            >
              <img
                src={event.image?.trim() ? event.image : PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-full h-54 sm:h-56 md:h-60 object-contain"
              />

              <div className="p-4 flex flex-col flex-1">
                {/* Titre */}
                <div className="text-xl font-semibold mb-2 line-clamp-2 overflow-y-auto max-h-14">
                  {event.title}
                </div>

                {/* Description */}
                <div
                  className={`text-sm text-muted-foreground mb-2 flex-1 overflow-y-auto ${
                    event.source === "meetup-full" ||
                    event.source === "tourismehautegaronne"
                      ? "max-h-16"
                      : "max-h-20"
                  }`}
                >
                  {event.description}
                </div>

                {/* Date */}
                <p className="text-sm font-medium mb-1">
                  {event.dateFormatted ||
                    event.date ||
                    event.start ||
                    "Date non renseignée"}
                </p>

                {/* Adresse */}
                <p className="text-sm text-muted-foreground mb-1">
                  {event.fullAddress || event.location}
                </p>

                {/* Source + catégorie */}
                <p className="text-xs text-muted-foreground italic mb-3">
                  Catégorie : {getCategory(event)} • Source :{" "}
                  {event.source || "Inconnue"}
                </p>

                {/* Lien */}
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

      {/* MODE LISTE */}
      {viewMode === "list" && filteredEvents.length > 0 && (
        <div className="space-y-4 mt-6">
          {filteredEvents.map((event, i) => (
            <div
              key={event.id || i}
              className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm"
            >
              <img
                src={event.image?.trim() ? event.image : PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />

              <div className="flex flex-col flex-1">
                <div className="text-lg font-semibold text-blue-700 line-clamp-2 overflow-y-auto max-h-10">
                  {event.title}
                </div>

                <div className="text-sm text-muted-foreground line-clamp-2 overflow-y-auto max-h-14">
                  {event.description}
                </div>

                <p className="text-sm">
                  {event.dateFormatted ||
                    event.date ||
                    event.start ||
                    "Date non renseignée"}
                </p>

                <p className="text-xs text-muted-foreground italic">
                  Catégorie : {getCategory(event)}
                </p>

                {event.url && (
                  <a
                    href={event.url}
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

      {!loading && filteredEvents.length === 0 && !error && (
        <p className="mt-6 text-muted-foreground">
          Aucun événement ne correspond à la recherche.
        </p>
      )}
    </div>
  );
}
