"use client"; // ⚠️ Indispensable si tu utilises useState / useEffect

import React, { useState, useEffect } from "react";

type Event = {
  id: string;
  title: string;
  start_date: string;
  location?: string;
  description?: string;
};

export default function FranceTravailPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2025-11-10");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/francetravail?page=${page}&start_date=${startDate}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [page, startDate]);

  return (
    <div>
      <h1>Événements France Travail - Haute-Garonne</h1>

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
      ) : events.length === 0 ? (
        <p>Aucun événement trouvé.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id} style={{ marginBottom: "1rem" }}>
              <h2>{event.title}</h2>
              <p>Date : {event.start_date}</p>
              {event.location && <p>Lieu : {event.location}</p>}
              {event.description && <p>{event.description}</p>}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Précédent
        </button>
        <span style={{ margin: "0 1rem" }}>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Suivant</button>
      </div>
    </div>
  );
}
