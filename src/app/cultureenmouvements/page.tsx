'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Configuration pour le format de date français
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export default function CultureEnMouvementsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/cultureenmouvements"); // ton route.ts iCal filtré Haute-Garonne
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`API HTTP error: ${res.status} ${res.statusText} - ${errorBody.error || 'Erreur non détaillée'}`);
      }
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la récupération des événements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">
        Événements Culture en Mouvements (Haute-Garonne - 31)
      </h1>
      <p className="text-muted-foreground mb-6">
        Récupération des événements du site officiel, filtrés sur le département 31.
      </p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition duration-200">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-100 text-red-800 border-l-4 border-red-600 rounded mb-6 font-mono text-sm">
          Erreur: {error}
        </div>
      )}

      {events.length === 0 && !loading && (
        <p className="text-gray-500 italic">
          Aucun événement trouvé en Haute-Garonne (31) ou l'API n'a pas encore renvoyé de données.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div
            key={ev.id}
            className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col transition duration-300 hover:shadow-2xl border border-gray-100"
          >
            {/* ✅ IMAGE (nouveau) */}
            <div className="h-48 overflow-hidden">
                {/* L'image est un chemin relatif ou absolu. Si c'est relatif (ex: /logo/...) 
                    elle doit être servie depuis le dossier /public ou l'URL du site source. 
                    Nous utilisons directement l'URL fournie par le scraping. */}
                <img 
                    src={ev.image.startsWith('/') ? `https://www.cultureenmouvements.org${ev.image}` : ev.image} 
                    alt={`Illustration pour ${ev.title}`}
                    className="w-full h-full object-cover transform hover:scale-105 transition duration-500"
                    // Placeholder si l'image ne charge pas
                    onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = 'https://placehold.co/600x400/94A3B8/FFFFFF?text=Culture+en+Mouvements'; 
                    }}
                />
            </div>

            <div className="p-4 flex flex-col flex-1">
              {/* ✅ Titre */}
              <h2 className="text-xl font-bold mb-1 text-gray-800 line-clamp-2">{ev.title}</h2>

              {/* ✅ Dates (corrigé) */}
              {ev.start && (
                <p className="text-sm text-indigo-600 font-semibold mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 10h.01M16 13h.01M8 17h.01M16 17h.01M3 21h18a2 2 0 002-2V5a2 2 0 00-2-2H3a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  {new Date(ev.start).toLocaleDateString('fr-FR', dateFormatOptions)}
                  {/* ev.end est null dans l'API actuelle, donc on ne l'affiche pas */}
                </p>
              )}


              {/* ✅ Lieu */}
              {ev.location && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {ev.location}
                </p>
              )}

              {/* Lien vers l'événement */}
              {ev.link && (
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-700 mt-auto pt-2 transition duration-200 font-medium flex items-center">
                    Voir les détails
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              )}
              
              {/* ✅ Source */}
              <p className="text-xs text-gray-400 mt-1">
                Source : {ev.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}