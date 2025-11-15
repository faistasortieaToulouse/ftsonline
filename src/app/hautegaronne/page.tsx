'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";
const API_BASE = "https://data.haute-garonne.fr/api/explore/v2.1/catalog/datasets/evenements-publics/records";
const PAGE_LIMIT = 100;

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchUpcomingEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const today = new Date().toISOString().slice(0, 10);

      const url = `${API_BASE}?limit=${PAGE_LIMIT}` +
        `&timezone=Europe/Paris` +
        `&select=title_fr,description_fr,firstdate_begin,location_name,location_address,location_postalcode,location_city,image,canonicalurl` +
        `&where=firstdate_begin>='${today}'` +
        `&sort=firstdate_begin ASC`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setEvents([]);
        return;
      }

      // Mapping et extraction des informations
      const mapped = data.results
        .map((item: any) => {
          const fields = item.record?.fields || item.fields || item;
          const title = fields.title_fr || "";
          const description = fields.description_fr || "";
          const dateStr = fields.firstdate_begin || "";
          const locationName = fields.location_name || "";
          const street = fields.location_address || "";
          const postalCode = fields.location_postalcode || "";
          const city = fields.location_city || "";
          const image = fields.image || PLACEHOLDER_IMAGE;
          const url = fields.canonicalurl || null;

          const date = dateStr ? new Date(dateStr) : null;
          if (!title || !description || !locationName || !date || isNaN(date.getTime())) return null;

          const fullAddress = [locationName, street, postalCode, city].filter(Boolean).join(", ");

          return { title, description, date, image, url, location: locationName, fullAddress };
        })
        .filter(Boolean);

      // Supprimer les doublons par title+date+location
      const uniqueEventsMap = new Map<string, any>();
      mapped.forEach(ev => {
        const key = `${ev.title}-${ev.date.toISOString()}-${ev.location}`;
        if (!uniqueEventsMap.has(key)) uniqueEventsMap.set(key, ev);
      });

      const uniqueEvents = Array.from(uniqueEventsMap.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, PAGE_LIMIT)
        .map((ev, index) => ({
          ...ev,
          id: `${ev.title}-${ev.date.toISOString()}-${index}`,
          dateFormatted: ev.date.toLocaleString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          source: "Culture Haute-Garonne",
        }));

      setEvents(uniqueEvents);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Test API Haute-Garonne</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les 100 prochains événements à partir d’aujourd’hui.
      </p>

      <Button onClick={fetchUpcomingEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Tester maintenant"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <p className="text-sm text-muted-foreground mb-2 flex-1 line-clamp-4">{event.description}</p>
                <p className="text-sm font-medium mb-1">{event.dateFormatted}</p>
                <p className="text-sm text-muted-foreground mb-1">{event.fullAddress}</p>
                <p className="text-xs text-muted-foreground italic mb-3">Source : {event.source}</p>
                {event.url && (
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition"
                  >
                    🔗 Voir l’événement officiel
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-muted-foreground">
          {loading ? "Chargement des événements..." : "Aucun événement à venir trouvé."}
        </p>
      )}
    </div>
  );
}
