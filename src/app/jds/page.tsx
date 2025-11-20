"use client";

import React, { useState, useEffect } from "react";

type JDSEvent = {
  title: string;
  description?: string;
  url: string;
  image?: string;
  categories?: string[];
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
      <h1>Évènements JDS à Toulouse</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((event, idx) => (
            <li
              key={idx}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h2>{event.title}</h2>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  style={{ maxWidth: "300px", borderRadius: "6px" }}
                />
              )}
              {event.description && <p>{event.description}</p>}
              {event.categories && event.categories.length > 0 && (
                <p>
                  Rubriques :{" "}
                  {event.categories.map((cat, i) => (
                    <span key={i}>
                      {cat}
                      {i < event.categories!.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              )}
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
