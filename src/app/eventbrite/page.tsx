"use client";

import React, { useState, useEffect } from "react";

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
    <div>
      <h1>Évènements Eventbrite autour de Toulouse</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} style={{ marginBottom: "1rem" }}>
              <h2>{event.name.text}</h2>
              <p>
                Début :{" "}
                {new Date(event.start.local).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {event.end && (
                <p>
                  Fin :{" "}
                  {new Date(event.end.local).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {event.description?.text && <p>{event.description.text}</p>}
              <p>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  Voir sur Eventbrite
                </a>
              </p>
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
