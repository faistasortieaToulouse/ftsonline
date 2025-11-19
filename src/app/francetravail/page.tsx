"use client";

import React, { useState, useEffect } from "react";

type FTEvent = {
  idEvenement: string;
  titre: string;
  dateDebut: string;
  lieu?: {
    nom?: string;
    codePostal?: string;
    ville?: string;
  };
  description?: string;
};

export default function FranceTravailPage() {
  const [events, setEvents] = useState<FTEvent[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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
          // Tri chronologique
          const sorted = (data.events || []).sort(
            (a: FTEvent, b: FTEvent) =>
              new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
          );
          setEvents(sorted);
        }
      } catch (error) {
        console.error("Erreur chargement événements", error);
        setError("Impossible de charger les salons en ligne.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, [page, startDate]);

  return (
    <div>
      <h1>Salons en ligne France Travail - Haute-Garonne</h1>

      <label>
        Filtrer à partir de la date :{" "}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun salon en ligne trouvé.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.idEvenement} style={{ marginBottom: "1rem" }}>
              <h2>{event.titre}</h2>
              <p>
                Date :{" "}
                {new Date(event.dateDebut).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              {event.lieu && (
                <p>
                  Lieu :{" "}
                  {event.lieu.nom
                    ? event.lieu.nom
                    : `${event.lieu.codePostal || ""} ${event.lieu.ville || ""}`}
                </p>
              )}

              {event.description && <p>{event.description}</p>}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "1rem" }}>
        {page > 1 && (
          <button onClick={() => setPage((p) => p - 1)}>Précédent</button>
        )}

        <span style={{ margin: "0 1rem" }}>Page {page}</span>

        <button onClick={() => setPage((p) => p + 1)}>Suivant</button>
      </div>
    </div>
  );
}
