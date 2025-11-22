'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getEventImage } from "@/utils/eventImages";

const MAX_EVENTS = 100;

export default function ToulouseEventsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchUpcomingEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/toulousemetropole");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      if (!data || !Array.isArray(data)) {
        setEvents([]);
        return;
      }

      // Supprimer doublons par title+date+location
      const unique = new Map<string, any>();
      data.forEach(ev => {
        const key = `${ev.title}-${ev.date}-${ev.lieu_nom || ev.location}`;
        if (!unique.has(key)) unique.set(key, ev);
      });

      const cleaned = Array.from(unique.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, MAX_EVENTS)
        .map((ev, index) => {
          // Construire adresse complète
          const fullAddress = [
            ev.lieu_nom,
            ev.lieu_adresse_1,
            ev.lieu_adresse_2,
            ev.lieu_adresse_3,
            ev.code_postal,
            ev.commune,
          ].filter(Boolean).join(", ");

          return {
            ...ev,
            id: `${ev.id}-${index}`,
            image: getEventImage(ev),
            fullAddress,
            category: ev.categorie_de_la_manifestation,
            type: ev.type_de_manifestation,
            theme: ev.theme_de_la_manifestation,
            dateFormatted: new Date(ev.date).toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          };
        });

      setEvents(cleaned);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Toulouse Métropole</h1>
      <p className="text-muted-foreground mb-6">
        Cette page affiche les 100 prochains événements culturels à Toulouse.
      </p>

      <Button onClick={fetchUpcomingEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement à venir.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
            <img
              src={ev.image}
              alt={ev.title}
              className="w-full aspect-[16/9] object-cover"
            />

            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-xl font-semibold">{ev.title}</h2>

              {/* Catégorie / type / thème */}
              {(ev.category || ev.type || ev.theme) && (
                <p className="text-sm text-blue-600 font-medium mt-1">
                  {ev.category || ev.type || ev.theme}
                </p>
              )}

              <p className="text-sm text-muted-foreground mt-2 flex-1 line-clamp-4">
                {ev.description}
              </p>

              <p className="text-sm mt-2">{ev.dateFormatted}</p>

              {/* Adresse complète */}
              {ev.fullAddress && (
                <p className="text-sm text-muted-foreground">{ev.fullAddress}</p>
              )}

              <p className="text-xs text-muted-foreground italic mt-1">
                Source : Toulouse Métropole
              </p>

              {ev.url && (
                <a
                  href={ev.url}
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
    </div>
  );
}
