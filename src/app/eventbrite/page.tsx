"use client";

import React, { useState, useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description?: { text: string };
  start: { local: string };
  end: { local: string };
  url: string;
};

export default function EventbritePage() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Mode d'affichage : PAR DÉFAUT plein écran
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/eventbrite?page=${page}`);
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API Eventbrite");
          setEvents([]);
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Erreur chargement Eventbrite", err);
        setError("Impossible de charger les évènements Eventbrite.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [page]);

  return (
    <div className="container mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-4">
        Évènements Eventbrite autour de Toulouse
      </h1>

      {/* Boutons du mode d'affichage */}
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

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <>
          {/* ===================================================================================== */}
          {/* 🟥 MODE PLEIN ÉCRAN */}
          {/* ===================================================================================== */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg shadow p-4 bg-white flex flex-col"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {event.name.text}
                  </h2>

                  <p className="text-sm font-medium text-blue-600 mb-2">
                    Début :{" "}
                    {new Date(event.start.local).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>

                  {event.end && (
                    <p className="text-sm mb-2">
                      Fin :{" "}
                      {new Date(event.end.local).toLocaleString("fr-FR", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  )}

                  {event.description?.text && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-4">
                      {event.description.text}
                    </p>
                  )}

                  <a
                    className="mt-auto text-blue-600 underline text-sm"
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur Eventbrite →
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* ===================================================================================== */}
          {/* 🟨 MODE LISTE (VIGNETTE) */}
          {/* ===================================================================================== */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 border rounded-lg shadow bg-white"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                    IMG
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold line-clamp-2">
                      {event.name.text}
                    </h2>

                    <p className="text-sm text-blue-600">
                      {new Date(event.start.local).toLocaleString("fr-FR")}
                    </p>

                    {event.description?.text && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {event.description.text}
                      </p>
                    )}

                    <a
                      className="text-blue-600 underline text-sm block mt-1"
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Voir →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-8">
        {page > 1 && (
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </button>
        )}
        <span>Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
