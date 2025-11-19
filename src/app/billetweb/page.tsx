"use client";

import React, { useState, useEffect } from "react";

type BilletwebEvent = {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  url: string;
};

export default function BilletwebPage() {
  const [events, setEvents] = useState<BilletwebEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <h1>Évènements Billetweb (Haute-Garonne)</h1>

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
              <h2>{event.name}</h2>
              <p>
                Début :{" "}
                {new Date(event.start_date).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {event.end_date && (
                <p>
                  Fin :{" "}
                  {new Date(event.end_date).toLocaleString("fr-FR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {event.description && <p>{event.description}</p>}
              <p>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  Voir sur Billetweb
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
