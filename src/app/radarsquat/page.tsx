// src/app/radarsquat/page.tsx
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
      // 🎯 CORRECTION CLÉ : Changer l'URL vers la route API
      const res = await fetch("/api/radarsquat", { cache: "no-store" });
      
      if (!res.ok) {
        // Amélioration : Tenter de lire le message d'erreur JSON du serveur
        let errorMsg = `Erreur API: ${res.status}`;
        try {
            const errorBody = await res.json();
            // Si la route.ts a renvoyé { error: "..." }
            if (errorBody && errorBody.error) {
                errorMsg = errorBody.error; 
            }
        } catch (e) {
            // Si la réponse n'était pas du JSON (par exemple, si le serveur a encore renvoyé du HTML malgré le statut non-200)
            errorMsg += " (Le corps de réponse n'est pas du JSON)";
        }
        
        throw new Error(errorMsg);
      }

      // Si res.ok est vrai, nous sommes sûrs que c'est le JSON des événements
      const data = await res.json();
      setEvents(data);
      
    } catch (err: any) {
      // Affiche le message d'erreur plus détaillé (e.g., "Échec de la connexion...")
      setError(err.message || "Erreur inconnue de récupération des événements");
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
          Erreur : {error}
        </div>
      )}

      {events.length === 0 && !loading && !error && (
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
