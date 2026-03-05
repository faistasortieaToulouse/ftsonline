'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// On garde le même placeholder pour la cohérence
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Atélatoi";

type MeetupEvent = {
  title: string;
  link: string;
  startDate: Date;          
  location: string; 
  description: string;      
  dateFormatted: string;   
  fullAddress: string;     
  image?: string;           
  categories?: string[];
};

export default function AtelatoiEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MeetupEvent[]>([]);
  
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      // ON APPELLE L'API SPÉCIFIQUE ATELATOI
      const res = await fetch("/api/atelatoi");
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erreur API: ${res.status}`);
      }

      const data = await res.json();
      if (!data.events) return;

      const mapped: MeetupEvent[] = data.events.map((ev: any) => {
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
          startDate: dateRaw!,
          location: ev.location || 'Lieu non spécifié',
          description: ev.description || '',
          dateFormatted,
          fullAddress: ev.fullAddress || ev.location || 'Lieu non spécifié',
          // L'API renvoie coverImage, on le mappe sur image pour le composant
          image: ev.coverImage || PLACEHOLDER_IMAGE,
          categories: ev.categories || [],
        } as MeetupEvent;
      });

      setEvents(mapped);
      setFilteredEvents(mapped);

    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des événements Atélatoi.");
    } finally {
      setLoading(false);
    }
  }

  // Filtrage identique à meetup-events
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filtered = events.filter(ev =>
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      (ev.dateFormatted.toLowerCase().includes(q))
    );

    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4">Test Filtrage : Atélatoi Toulouse</h1>
      
      <p className="text-muted-foreground mb-6">
        Affichage des événements du groupe "Atélatoi Bordeaux" qui ont lieu à Toulouse.
      </p>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher dans les événements Atélatoi..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-purple-300"
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded font-medium ${viewMode === "card" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
          >
            🗂️ Cards
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded font-medium ${viewMode === "list" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
          >
            📋 Liste
          </button>
        </div>

        <Button onClick={fetchEvents} disabled={loading} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
          {loading ? "Chargement..." : "🔄 Rafraîchir"}
        </Button>
      </div>

      <p className="mb-4 font-semibold text-purple-800">Événements trouvés : {filteredEvents.length}</p>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <div className="mt-6 text-xl text-gray-500 p-12 border border-dashed rounded-lg text-center bg-white">
          Aucun événement "Toulouse" trouvé dans le flux Atélatoi.
        </div>
      )}

      {/* Rendu des cartes (Card Mode) */}
      {viewMode === "card" && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredEvents.map((event, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 transition-hover hover:shadow-xl">
              <div className="relative aspect-[16/9] bg-gray-100">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-bold mb-2 text-purple-900 line-clamp-2">{event.title}</h2>
                <p className="text-sm font-semibold mb-1">📅 {event.dateFormatted}</p>
                <p className="text-sm text-gray-600 mb-3 italic">📍 {event.location}</p>
                <p className="text-sm text-gray-700 mb-4 flex-1 line-clamp-3 whitespace-pre-wrap">{event.description}</p>
                
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block w-full bg-purple-600 text-white text-center py-2 rounded font-bold hover:bg-purple-700 transition"
                >
                  Voir sur Meetup ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rendu liste (List Mode) */}
      {viewMode === "list" && filteredEvents.length > 0 && (
        <div className="space-y-4 mt-6">
          {filteredEvents.map((event, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg shadow-sm bg-white items-start sm:items-center">
              <img
                src={event.image}
                alt={event.title}
                className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded shadow-inner"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-purple-900">{event.title}</h2>
                <p className="text-sm font-medium">{event.dateFormatted} — {event.location}</p>
                <p className="text-sm text-gray-600 line-clamp-1">{event.description}</p>
              </div>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 font-bold hover:underline"
              >
                Voir →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
