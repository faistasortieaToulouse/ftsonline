'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type EventItem = {
  id: string;
  source: string;
  title: string;
  description: string | null;
  location: string | null;
  link: string | null;
  start: string | null;
  end: string | null;
  image: string | null;
};

export default function RadarSquatPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);
    try {
      const res = await fetch("/radarsquat", { cache: "no-store" });
      // Pour diagnostiquer, décommente ces deux lignes:
      // const text = await res.text();
      // console.log(text);

      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Radar Squat Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Flux iCalendar transformé en JSON côté serveur, affiché ici.
      </p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement trouvé pour le moment.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
            {/* Image (par défaut car ICS n’a pas d’image) */}
            {ev.image && (
              <div className="relative w-full h-40 bg-gray-100">
                <Image src={ev.image} alt={ev.title} fill className="object-contain" />
              </div>
            )}

            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{ev.title}</h2>

              {/* Date / heure */}
              {ev.start && (
                <p className="text-sm text-blue-600">
                  {new Date(ev.start).toLocaleString("fr-FR")}
                  {ev.end ? ` → ${new Date(ev.end).toLocaleString("fr-FR")}` : ""}
                </p>
              )}

              {/* Lieu */}
              {ev.location && (
                <p className="text-sm text-muted-foreground">📍 {ev.location}</p>
              )}

              {/* Description (texte ICS, sans HTML) */}
              {ev.description && (
                <div className="text-sm text-muted-foreground line-clamp-6">
                  {ev.description}
                </div>
              )}

              {/* Lien */}
              {ev.link && (
                <a
                  href={ev.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 underline"
                >
                  🔗 Voir l’événement
                </a>
              )}

              {/* Source */}
              <p className="text-xs text-muted-foreground mt-2">Source : {ev.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
