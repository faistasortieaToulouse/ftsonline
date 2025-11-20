"use client";

import React, { useState, useEffect } from "react";

export default function JDSPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const res = await fetch("/api/jds");
      const data = await res.json();
      setEvents(data.events || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Évènements JDS à Toulouse</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : events.length === 0 ? (
        <p>Aucun évènement trouvé.</p>
      ) : (
        <ul>
          {events.map((ev, idx) => (
            <li key={idx}>
              <h2>{ev.title}</h2>
              {ev.date && <p>Date : {ev.date}</p>}
              {ev.place && <p>Lieu : {ev.place}</p>}
              {ev.price && <p>Tarif : {ev.price}</p>}
              {ev.description && <p>{ev.description}</p>}
              {ev.url && (
                <a href={ev.url} target="_blank" rel="noopener noreferrer">
                  Voir sur JDS
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
