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
        const res = await fetch("/api/capitole-min"); // ✅ côté serveur
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
        <li key={ev.id}>
          <a href={ev.url} target="_blank">{ev.title}</a> — {ev.start}
        </li>
      ))}
    </ul>
  );
}
