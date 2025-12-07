// src/lib/meetup.ts
export const API_ROUTES = [
  "meetup-events",
  "meetup-expats",
  "meetup-coloc",
  "meetup-sorties",
];

const MEETUP_CACHE_TTL = 1000 * 60 * 5; // 5 min
const meetupCache: Record<string, { timestamp: number; data: any[] }> = {};

export async function getMeetupEvents(origin: string): Promise<any[]> {
  const now = Date.now();
  const cached = meetupCache["all"];
  if (cached && now - cached.timestamp < MEETUP_CACHE_TTL) {
    return cached.data;
  }

  const results = await Promise.all(
    API_ROUTES.map(async (route) => {
      try {
        const res = await fetch(`${origin}/api/${route}`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.events) ? data.events : [];
      } catch (err) {
        console.warn(`Erreur fetch Meetup ${route}:`, err);
        return [];
      }
    })
  );

  const events = results.flat();
  meetupCache["all"] = { timestamp: now, data: events };
  return events;
}
