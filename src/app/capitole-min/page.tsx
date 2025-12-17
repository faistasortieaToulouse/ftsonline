"use client";
import { useEffect, useState } from "react";

type Event = {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  start: string;
  source: string;
};

export default function TestCapitole() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/capitole-min"); // ✅ Appel côté serveur
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Erreur fetch capitole:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (events.length === 0) return <p>Aucun événement trouvé.</p>;

  return (
    <ul>
      {events.map(ev => (
        <li key={ev.id} style={{ marginBottom: "1rem" }}>
          <img src={ev.image} alt={ev.title} width={100} style={{ marginRight: 10 }} />
          <a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.title}</a>
          <div>{new Date(ev.start).toLocaleString()}</div>
          <div>{ev.description}</div>
        </li>
      ))}
    </ul>
  );
}
