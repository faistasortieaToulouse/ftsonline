"use client";

import React, { useState, useEffect } from "react";

type TicketmasterEvent = {
  id: string;
  name: string;
  date?: string;
  venue?: string;
  city?: string;
  url: string;
};

export default function TicketmasterPage() {
  const [events, setEvents] = useState<TicketmasterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ticketmaster");
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setEvents([]);
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        setError("Impossible de charger les évènements Ticketmaster.");
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Évènements Ticketmaster en France</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((ev) => (
            <li
              key={ev.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h2>{ev.name}</h2>
              {ev.date && <p>Date : {ev.date}</p>}
              {ev.venue && <p>Lieu : {ev.venue}</p>}
              {ev.city && <p>Ville : {ev.city}</p>}
              <p>
                <a href={ev.url} target="_blank" rel="noopener noreferrer">
                  Voir sur Ticketmaster
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
