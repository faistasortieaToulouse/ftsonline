// File: app/discord/page.tsx
"use client";

import { useEffect, useState } from "react";

type DiscordEvent = {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  entity_type: number;
};

export default function DiscordEventsPage() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/discord");
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
        } else {
          setError(data.error || "Erreur inconnue");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Chargement des évènements...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Évènements Discord</h1>
      {events.length === 0 && <p>Aucun évènement.</p>}
      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="border p-4 rounded-xl">
            <h2 className="text-xl font-semibold">{ev.name}</h2>
            {ev.description && <p className="text-sm mt-1">{ev.description}</p>}
            <p className="text-sm mt-2">
              Début : {new Date(ev.scheduled_start_time).toLocaleString()}
            </p>
            {ev.scheduled_end_time && (
              <p className="text-sm">Fin : {new Date(ev.scheduled_end_time).toLocaleString()}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
