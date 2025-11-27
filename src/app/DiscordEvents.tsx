// src/app/DiscordEvents.tsx
'use client';

import { useEffect, useState } from 'react';

interface DiscordEvent {
  id: string;
  name: string;
  date: string;
}

export default function DiscordEvents() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscordEvents() {
      try {
        const res = await fetch('/api/discord');
        if (!res.ok) throw new Error('Erreur lors du fetch Discord');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDiscordEvents();
  }, []);

  if (loading) return <p>Chargement des événements Discord...</p>;
  if (events.length === 0) return <p>Aucun événement Discord disponible.</p>;

  return (
    <ul>
      {events.map(e => (
        <li key={e.id}>
          <strong>{e.name}</strong> — {e.date}
        </li>
      ))}
    </ul>
  );
}
