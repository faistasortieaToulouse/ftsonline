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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Mode d’affichage : plein écran par défaut
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/billetweb");
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API Billetweb");
          setEvents([]);
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Erreur chargement Billetweb", err);
        setError("Impossible de charger les évènements Billetweb.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        Évènements Billetweb (Haute-Garonne)
      </h1>

      {/* 🟦 Toggle plein écran / vignette */}
      {events.length > 0 && (
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
      {events.length === 0 && !loading && !error && (
        <p>Aucun évènement trouvé.</p>
      )}

      {/* ====================================================== */}
      {/* 🟥 MODE PLEIN ÉCRAN (CARDS) */}
      {/* ====================================================== */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
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
          {events.map((event) => (
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
                  <p className="text-sm text-muted-foreground">
                    📍 {event.place}
                  </p>
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
