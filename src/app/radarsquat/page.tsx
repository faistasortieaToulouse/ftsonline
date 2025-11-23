'use client';

import { useState, useEffect, useCallback } from "react";
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
    const [includePast, setIncludePast] = useState(false);
    
    // 🟦 Nouveau : mode d'affichage (plein écran / vignette)
    const [viewMode, setViewMode] = useState<"card" | "list">("card");

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        setEvents([]);
        try {
            const apiUrl = includePast ? "/api/radarsquat?past=true" : "/api/radarsquat";
            const res = await fetch(apiUrl, { cache: "no-store" });
            if (!res.ok) {
                let errorMsg = `Erreur API: ${res.status}`;
                try {
                    const errorBody = await res.json();
                    if (errorBody && errorBody.error) errorMsg = errorBody.error;
                } catch {}
                throw new Error(errorMsg);
            }
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error("Format de réponse inattendu : pas un tableau.");
            setEvents(data);
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }, [includePast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const togglePastEvents = () => setIncludePast(prev => !prev);

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Événements Radar Squat Toulouse</h1>
            <p className="text-muted-foreground mb-6">
                Flux iCalendar transformé en JSON côté serveur.
            </p>

            {/* BOUTONS D'ACTION + MODE */}
            <div className="flex flex-wrap gap-4 mb-6">
                <Button onClick={fetchEvents} disabled={loading}>
                    {loading ? "Chargement..." : "📡 Actualiser"}
                </Button>
                <Button onClick={togglePastEvents} disabled={loading} variant={includePast ? "destructive" : "secondary"}>
                    {includePast ? "🔴 Afficher futurs uniquement" : "🟢 Afficher tous les événements"}
                </Button>
                <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
                    📺 Plein écran
                </Button>
                <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
                    🔲 Vignette
                </Button>
            </div>
            {/* FIN BOUTONS */}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
                    Erreur : {error}
                </div>
            )}

            {events.length === 0 && !loading && !error && (
                <p className="text-muted-foreground">
                    {includePast ? "Aucun événement trouvé." : "Aucun événement futur ou en cours."}
                </p>
            )}

            {/* ========================================================== */}
            {/* MODE PLEIN ÉCRAN (CARD) */}
            {/* ========================================================== */}
{viewMode === "card" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {events.map(ev => {
      if (!ev.title || !ev.start) return null;
      return (
        <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
          {ev.image && (
            <div className="relative w-full h-40 bg-gray-100">
              <Image src={ev.image} alt={ev.title} fill className="object-contain" />
            </div>
          )}
          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-lg font-semibold">{ev.title}</h2>
            {includePast && ev.end && new Date(ev.end) < new Date() && (
              <span className="text-sm font-bold text-red-500">TERMINÉ</span>
            )}
            {ev.start && (
              <p className="text-sm text-blue-600">
                {new Date(ev.start).toLocaleString("fr-FR")}
                {ev.end ? ` → ${new Date(ev.end).toLocaleString("fr-FR")}` : ""}
              </p>
            )}
            {ev.location && <p className="text-sm text-muted-foreground">📍 {ev.location}</p>}
            {ev.description && (
              <div className="text-sm text-muted-foreground line-clamp-4">{ev.description}</div>
            )}
            {ev.link && (
              <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline">
                🔗 Voir l’événement
              </a>
            )}
            <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
          </div>
        </div>
      );
    })}
  </div>
)}


            {/* ========================================================== */}
            {/* MODE LISTE (VIGNETTE) */}
            {/* ========================================================== */}
            {viewMode === "list" && (
                <div className="space-y-4">
                    {events.map(ev => {
                        if (!ev.title || !ev.start) return null;
                        return (
                            <div key={ev.id} className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm">
                                {ev.image && <img src={ev.image} alt={ev.title} className="w-24 h-24 rounded object-cover flex-shrink-0" />}
                                <div className="flex flex-col flex-1">
                                    <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>
                                    {ev.location && <p className="text-sm text-muted-foreground">{ev.location}</p>}
                                    {ev.start && <p className="text-sm">{new Date(ev.start).toLocaleString("fr-FR")}</p>}
                                    {ev.link && <a href={ev.link} target="_blank" className="mt-1 text-blue-600 underline">Voir →</a>}
                                    <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
