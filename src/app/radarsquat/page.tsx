// src/app/radarsquat/page.tsx
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

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        setEvents([]);
        try {
            // Utilise la route API avec le paramètre de débogage
            const apiUrl = includePast ? "/api/radarsquat?past=true" : "/api/radarsquat";
            const res = await fetch(apiUrl, { cache: "no-store" });
            
            if (!res.ok) {
                let errorMsg = `Erreur API: ${res.status}`;
                try {
                    // Tente de lire le message d'erreur JSON du serveur (si présent)
                    const errorBody = await res.json();
                    if (errorBody && errorBody.error) {
                        errorMsg = errorBody.error; 
                    }
                } catch (e) {
                    // Si le corps n'est pas du JSON, utilise le message d'erreur standard
                    errorMsg += " (Le corps de réponse n'est pas du JSON)";
                }
                
                throw new Error(errorMsg);
            }

            const data = await res.json();
            
            // Assure-toi que data est un tableau avant de l'appliquer
            if (!Array.isArray(data)) {
                throw new Error("Format de réponse inattendu : l'API n'a pas renvoyé un tableau d'événements.");
            }
            
            setEvents(data);
            
        } catch (err: any) {
            setError(err.message || "Erreur inconnue de récupération des événements");
        } finally {
            setLoading(false);
        }
    }, [includePast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Fonction pour basculer le mode d'affichage
    const togglePastEvents = () => {
        setIncludePast(prev => !prev);
    }

    return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-4">Événements Radar Squat Toulouse</h1>
            <p className="text-muted-foreground mb-6">
                Flux iCalendar transformé en JSON côté serveur, affiché ici.
            </p>

            {/* BOUTONS D'ACTION */}
            <div className="flex gap-4 mb-6">
                <Button onClick={fetchEvents} disabled={loading}>
                    {loading ? "Chargement..." : "📡 Actualiser"}
                </Button>
                <Button onClick={togglePastEvents} disabled={loading} variant={includePast ? "destructive" : "secondary"}>
                    {includePast ? "🔴 Afficher les événements FUTURS uniquement" : "🟢 Afficher TOUS les événements (Passés & Futurs)"}
                </Button>
            </div>
            {/* FIN BOUTONS D'ACTION */}


            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
                    Erreur : {error}
                </div>
            )}

            {events.length === 0 && !loading && !error && (
                <p className="text-muted-foreground">
                    {includePast ? "Aucun événement n'a été trouvé dans ce flux." : "Aucun événement futur ou en cours n'a été trouvé."}
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(ev => {
                    // 🚨 CORRECTION : S'assurer que le titre et la date de début existent
                    // pour éviter d'afficher des cartes vides qui causaient l'espace indésirable.
                    if (!ev.title || !ev.start) {
                        return null; // Important: retourne null dans la fonction map pour ne rien rendre.
                    }
                    
                    return (
                        <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
                            {ev.image && (
                                <div className="relative w-full h-40 bg-gray-100">
                                    <Image src={ev.image} alt={ev.title} fill className="object-contain" />
                                </div>
                            )}

                            <div className="p-4 flex flex-col gap-2">
                                <h2 className="text-lg font-semibold">{ev.title}</h2>

                                {/* Ajout d'un indicateur si l'événement est passé */}
                                {includePast && ev.end && new Date(ev.end) < new Date() && (
                                    <span className="text-sm font-bold text-red-500">TERMINÉ</span>
                                )}
                            
                                {/* Date / heure */}
                                {ev.start && (
                                    <p className="text-sm text-blue-600">
                                        {new Date(ev.start).toLocaleString("fr-FR")}
                                        {ev.end ? ` → ${new Date(ev.end).toLocaleString("fr-FR")}` : ""}
                                    </p>
                                )}
                                
                                {ev.location && (
                                    <p className="text-sm text-muted-foreground">📍 {ev.location}</p>
                                )}
                                {ev.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-6">
                                        {ev.description}
                                    </div>
                                )}
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
                                <p className="text-xs text-muted-foreground mt-2">Source : {ev.source}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}