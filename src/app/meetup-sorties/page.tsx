"use client";

import { useState, useEffect } from "react";
// Assurez-vous que le chemin vers votre composant Button est correct
import { Button } from "@/components/ui/button"; 

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Meetup";

// Type d'événement Meetup 
type MeetupEvent = {
  title: string;
  link: string;
  startDate: Date;          
  location: string; 
  description: string;      
  dateFormatted: string;   
  fullAddress: string;     
  image?: string;           
};

// Le composant doit être une fonction React valide et exportée par défaut
export default function MeetupEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/meetup-sorties");
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erreur API HTTP: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (!data.events || data.events.length === 0) {
        setEvents([]);
        return;
      }

      const mapped: MeetupEvent[] = data.events.map((ev: any, index: number) => {
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
          link: ev.link || '#',
          startDate: dateRaw,
          location: ev.location || 'Lieu non spécifié',
          description: ev.description || '',
          dateFormatted,
          fullAddress: ev.location || 'Lieu non spécifié',
          image: ev.coverImage || PLACEHOLDER_IMAGE, 
        } as MeetupEvent;
      });

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

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Évènements de Meetup Toulouse sorties évènements soirées balades visites randos</h1>
      
      <p className="text-muted-foreground mb-6">
        Prochains événements du groupe Meetup Toulouse sorties évènements soirées balades visites randos, sur 31 jours.
      </p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6 bg-red-600 hover:bg-red-700">
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
                <h2 className="text-xl font-semibold mb-2 text-red-700">{event.title}</h2>
                
                <p className="text-sm font-medium mb-1">📍 {event.fullAddress}</p>
                
                <p className="text-sm text-gray-600 mb-3 font-semibold">{event.dateFormatted}</p>
                
                <p 
                  className="text-sm text-gray-700 mb-2 flex-1 line-clamp-4 whitespace-pre-wrap"
                >
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
            : "Aucun événement à venir trouvé. Le tri et le filtrage ont été effectués par iCalendar."
          }
        </p>
      )}
    </div>
  );
}