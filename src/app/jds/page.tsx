'use client';

import React, { useState, useEffect } from "react";

type JDSEvent = {
  title: string;
  description?: string;
  url: string;
  image?: string;
  categories?: string[];
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

export default function JDSPage() {
  const [events, setEvents] = useState<JDSEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟦 Mode d'affichage : "card" = plein écran, "list" = vignette
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/jds");
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API JDS");
          setEvents([]);
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Erreur chargement JDS", err);
        setError("Impossible de charger les évènements JDS.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Évènements JDS à Toulouse</h1>

      {/* 🟦 Boutons pour changer le mode d'affichage */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded ${
            viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🗂️ Plein écran
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded ${
            viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📋 Vignette
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <>
          {/* 🟥 Mode plein écran */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <img
                    src={event.image || PLACEHOLDER_IMAGE}
                    alt={event.title}
                    className="w-full aspect-[16/9] object-cover"
                  />
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">
                        {event.description}
                      </p>
                    )}
                    {event.categories && (
                      <p className="text-sm mb-2">
                        Rubriques: {event.categories.join(", ")}
                      </p>
                    )}
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition"
                    >
                      🔗 Voir sur JDS
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🟨 Mode vignette */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border rounded-lg shadow bg-white"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={event.image || PLACEHOLDER_IMAGE}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold line-clamp-2">{event.title}</h2>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                    {event.categories && (
                      <p className="text-sm mt-1">Rubriques: {event.categories.join(", ")}</p>
                    )}
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm mt-1 block"
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
    </div>
  );
}
