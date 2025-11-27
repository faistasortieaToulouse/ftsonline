'use client';

import { useState, useEffect } from 'react';

interface DiscordEvent {
  id: string;
  name: string;
  description?: string;
  date?: string;
  location?: string;
  url?: string;
  image?: string;
}

interface UseDiscordEventsReturn {
  events: DiscordEvent[];
  loading: boolean;
}

const DISCORD_API = '/api/discord'; // ton endpoint Discord
const MAX_RETRIES = 5;

export function useDiscordEvents(): UseDiscordEventsReturn {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    const fetchEvents = async (retry = 0) => {
      try {
        const res = await fetch(DISCORD_API);
        if (!res.ok) {
          if (res.status === 429 && retry < MAX_RETRIES) {
            // Rate limit, attendre le temps indiqué dans "retry-after" si disponible
            const retryAfter = parseFloat(res.headers.get('retry-after') || '1') * 1000;
            console.warn(`Rate limit Discord, retry après ${retryAfter}ms`);
            setTimeout(() => fetchEvents(retry + 1), retryAfter);
            return;
          }
          throw new Error(`Erreur Discord: ${res.status}`);
        }

        const data = await res.json();
        if (!canceled) {
          setEvents(data.events || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erreur fetch Discord:', err);
        if (!canceled && retry < MAX_RETRIES) {
          setTimeout(() => fetchEvents(retry + 1), 2000);
        } else if (!canceled) {
          setLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      canceled = true; // éviter de setState après un unmount
    };
  }, []);

  return { events, loading };
}
