"use client";

import React, { useState, useEffect } from "react";

type JDSEvent = {
  title: string;
  date?: string;
  place?: string;
  url: string;
};

export default function JDSPage() {
  const [events, setEvents] = useState<JDSEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <h1>Évènements JDS aujourd’hui à Toulouse</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul>
          {events.map((event, idx) => (
            <li key={idx} style={{ marginBottom: "1rem" }}>
              <h2>{event.title}</h2>
              {event.date && <p>Date : {event.date}</p>}
              {event.place && <p>Lieu : {event.place}</p>}
              <p>
                <a href={event.url} target="_blank" rel="noopener noreferrer">
                  Voir sur JDS
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
