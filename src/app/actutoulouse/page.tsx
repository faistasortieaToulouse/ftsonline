"use client";

import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type BilletwebEvent = {
  id: string;
  name: string;
  start: string;
  end?: string;
  place?: string;
  shop?: string;
  description?: string;
  image?: string;
  cover?: string;
};

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x200?text=Événement";

export default function BilletwebPage() {
  const [events, setEvents] = useState<BilletwebEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<BilletwebEvent[]>([]);
  const [search, setSearch] = useState(""); // 🔍 recherche

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Mode d’affichage : plein écran par défaut
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // ======================
  // 📥 Chargement API
  // ======================
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/actutoulouse");
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API Billetweb");
          setEvents([]);
          setFilteredEvents([]);
        } else {
          setEvents(data.events || []);
          setFilteredEvents(data.events || []);
        }
      } catch (err) {
        console.error("Erreur chargement Actu Toulouse BilletWeb", err);
        setError("Impossible de charger les évènements Actu Toulouse Billetweb.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // ======================
  // 🔍 Filtrage dynamique
  // ======================
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }

    const q = search.toLowerCase();

    const result = events.filter((ev) => {
      const text =
        `${ev.name} ${ev.description || ""} ${ev.place || ""}`.toLowerCase();

      const formattedDate = new Date(ev.start)
        .toLocaleString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .toLowerCase();

      return text.includes(q) || formattedDate.includes(q);
    });

    setFilteredEvents(result);
  }, [search, events]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        Évènements Actu Toulouse Billetweb (Haute-Garonne)
      </h1>

      {/* 🔢 compteur */}
      <p className="text-muted-foreground mb-4">
        {filteredEvents.length} évènement(s) trouvé(s)
      </p>

      {/* 🔍 Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher (titre, lieu, description, date, catégorie...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 🟦 Toggle plein écran / vignette */}
      {filteredEvents.length > 0 && (
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as "card" | "list")}
          className="mb-6"
        >
          <ToggleGroupItem value="card" className="px-4 py-2">
            🗂️ Plein écran
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="px-4 py-2">
            📋 Vignette
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {filteredEvents.length === 0 && !loading && !error && (
        <p>Aucun évènement trouvé.</p>
      )}

      {/* ====================================================== */}
      {/* 🟥 MODE PLEIN ÉCRAN (CARDS) */}
      {/* ====================================================== */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded shadow flex flex-col overflow-hidden"
            >
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.name}
                className="w-full aspect-[16/9] object-cover"
              />

              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-1">{event.name}</h2>

                <p className="text-sm text-muted-foreground mb-1">
                  Début :{" "}
                  {new Date(event.start).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>

                {event.end && (
                  <p className="text-sm text-muted-foreground mb-1">
                    Fin :{" "}
                    {new Date(event.end).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                )}

                {event.place && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Lieu : {event.place}
                  </p>
                )}

                {event.description && (
                  <p className="text-sm text-muted-foreground flex-1 mb-3 line-clamp-4">
                    {event.description}
                  </p>
                )}

                {event.shop && (
                  <a
                    href={event.shop}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                  >
                    🎟️ Billetterie
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================== */}
      {/* 🟨 MODE LISTE (VIGNETTES) */}
      {/* ====================================================== */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 p-4 bg-white rounded shadow"
            >
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.name}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />

              <div>
                <h2 className="text-lg font-semibold">{event.name}</h2>

                <p className="text-sm text-muted-foreground">
                  {new Date(event.start).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                {event.place && (
                  <p className="text-sm text-muted-foreground">📍 {event.place}</p>
                )}

                {event.shop && (
                  <a
                    href={event.shop}
                    target="_blank"
                    className="text-blue-600 underline text-sm"
                  >
                    Billetterie →
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
