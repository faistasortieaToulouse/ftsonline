'use client';

import { useState, useEffect } from 'react';

interface DiscordEvent {
  id: string;
  name: string;
  date?: string;
  description?: string;
  url?: string;
  location?: string;
}

export function useDiscordEvents() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/discord');
        if (!res.ok) throw new Error('Erreur fetch Discord');
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err: any) {
        console.error(err);
        // retry automatique après 5s si rate limit ou erreur
        retryTimeout = setTimeout(fetchEvents, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => clearTimeout(retryTimeout);
  }, []);

  return { events, loading };
}
