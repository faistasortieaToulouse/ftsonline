"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Meetup";

type MeetupEvent = {
  title: string;
  link: string;
  startDate: Date | null;
  location: string;
  description: string;
  dateFormatted: string;
  fullAddress: string;
  image?: string;
};

export default function MeetupFullPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);

  // ----------------------------------------------------
  // Fetch des 4 endpoints API
  // ----------------------------------------------------
  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const endpoints = [
        "/api/meetup-events",
        "/api/meetup-expats",
        "/api/meetup-coloc",
        "/api/meetup-sorties",
      ];

      // Fetch parallélisé (en client → URLs relatives OK)
      const responses = await Promise.all(
        endpoints.map((ep) =>
          fetch(ep).then((res) => {
            if (!res.ok) throw new Error(`Erreur API ${ep}`);
            return res.json();
          })
        )
      );

      // Fusionne tous les events :
      // Chaque réponse est du type { events: [...] }
      const all = responses.flatMap((res) => res.events);

      // ----------------------------------------------------
      // Déduplication → clé = titre + date
      // ----------------------------------------------------
      const uniq = new Map<string, any>();
      all.forEach((ev: any) => {
        const key = `${ev.title}-${ev.startDate}`;
        if (!uniq.has(key)) uniq.set(key, ev);
      });

      const uniqueEvents = Array.from(uniq.values());

      // ----------------------------------------------------
      // Mapping des objets vers ton format UI
      // ----------------------------------------------------
      const mapped: MeetupEvent[] = uniqueEvents.map((ev: any) => {
        const dateRaw = ev.startDate ? new Date(ev.startDate) : null;

        const dateFormatted = dateRaw
          ? dateRaw.toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date non précisée";

        return {
          title: ev.title || "Événement sans titre",
          link: ev.link || "#",
          startDate: dateRaw,
          location: ev.location || "Lieu non spécifié",
          description: ev.description || "",
          dateFormatted,
          fullAddress: ev.fullAddress || ev.location || "Lieu non spécifié",
          image: ev.coverImage || PLACEHOLDER_IMAGE,
        } as MeetupEvent;
      });

      // ----------------------------------------------------
      // Tri chronologique (déjà trié côté API mais on sécurise)
      // ----------------------------------------------------
      mapped.sort(
        (a, b) =>
          (a.startDate?.getTime() || 0) -
          (b.startDate?.getTime() || 0)
      );

      setEvents(mapped);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors du chargement des événements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">
        Tous les évènements Meetup (agrégés)
      </h1>

      <p className="text-muted-foreground mb-6">
        Prochains événements en provenance de :
        <br />
        <strong>Meetup Toulouse expats, coloc, sorties & events</strong>
        <br />
        Sur 31 jours – triés & dédupliqués.
      </p>

      <Button
        onClick={fetchEvents}
        disabled={loading}
        className="mb-6 bg-red-600 hover:bg-red-700"
      >
        {loading ? "Chargement..." : "🔄 Rafraîchir les événements"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {events.map((event, index) => (
            <div
              key={event.link || index}
              className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-100"
            >
              <img
                src={event.image || PLACEHOLDER_IMAGE}
                alt={event.title}
                className="w-full aspect-[16/9] object-cover"
              />

              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2 text-red-700">
                  {event.title}
                </h2>

                <p className="text-sm font-medium mb-1">📍 {event.fullAddress}</p>

                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  {event.dateFormatted}
                </p>

                <p className="text-sm text-gray-700 mb-2 flex-1 line-clamp-4 whitespace-pre-wrap">
                  {event.description}
                </p>

                <p className="text-xs text-muted-foreground italic mb-3 mt-auto">
                  Source : Meetup
                </p>

                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-block bg-red-600 text-white text-center py-2 px-3 rounded hover:bg-red-700 transition"
                  >
                    🔗 Voir l’événement Meetup
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-xl text-gray-500 p-8 border border-dashed rounded-lg text-center">
          {loading
            ? "Chargement des événements..."
            : "Aucun événement trouvé pour les 31 prochains jours."}
        </p>
      )}
    </div>
  );
}
