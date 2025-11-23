'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type FTEvent = {
  idEvenement: string;
  titre: string;
  dateDebut: string;
  dateFin?: string;
  description?: string;
  localisation?: string;
  organismeOrganisateur?: string;
  urlSalonEnLigne?: string;
};

export default function FranceTravailPage() {
  const [events, setEvents] = useState<FTEvent[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // 🟦 Mode d'affichage : "card" = plein écran, "list" = vignette
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/francetravail?page=${page}&start_date=${startDate}`
        );
        const data = await res.json();

        if (data.error) {
          setError(data.details || "Erreur API France Travail");
          setEvents([]);
        } else {
          const sorted = (data.events || []).sort(
            (a: FTEvent, b: FTEvent) =>
              new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
          );
          setEvents(sorted);
        }
      } catch (error) {
        console.error("Erreur chargement salons en ligne", error);
        setError("Impossible de charger les salons en ligne.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [page, startDate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Salons en ligne France Travail - Haute-Garonne
      </h1>

      <label className="block mb-4">
        Filtrer à partir de la date :{" "}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </label>

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

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun salon en ligne trouvé.</p>
      ) : (
        <>
          {/* ============================================ */}
          {/* 🟥 Mode Plein écran */}
          {/* ============================================ */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.idEvenement}
                  className="border rounded-lg shadow p-4 bg-white flex flex-col"
                >
                  <h2 className="text-lg font-semibold mb-2">{event.titre}</h2>

                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Début :{" "}
                    {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  {event.dateFin && (
                    <p className="text-sm mb-1">
                      Fin :{" "}
                      {new Date(event.dateFin).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {event.localisation && (
                    <p className="text-sm text-gray-700 mb-1">
                      Localisation : {event.localisation}
                    </p>
                  )}

                  {event.organismeOrganisateur && (
                    <p className="text-sm text-gray-700 mb-1">
                      Organisateur : {event.organismeOrganisateur}
                    </p>
                  )}

                  {event.description && (
                    <p
                      className="text-sm text-gray-700 mb-2 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  )}

                  {event.urlSalonEnLigne && (
                    <a
                      href={event.urlSalonEnLigne}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto text-blue-600 underline text-sm"
                    >
                      Voir le salon en ligne →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ============================================ */}
          {/* 🟨 Mode Vignette */}
          {/* ============================================ */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.idEvenement}
                  className="flex gap-4 p-4 border rounded-lg shadow bg-white"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                    IMG
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold line-clamp-2">
                      {event.titre}
                    </h2>
                    <p className="text-sm text-blue-600">
                      {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    {event.localisation && (
                      <p className="text-sm text-gray-600">{event.localisation}</p>
                    )}
                    {event.urlSalonEnLigne && (
                      <a
                        href={event.urlSalonEnLigne}
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
        </>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-6">
        {page > 1 && (
          <Button variant="secondary" onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
        )}
        <span>Page {page}</span>
        <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
