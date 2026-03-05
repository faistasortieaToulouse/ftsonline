'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Meetup";

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
  source?: string; // Pour savoir d'où vient l'event
};

export default function MeetupEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MeetupEvent[]>([]);
  
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  // Fonction utilitaire pour mapper les données reçues des API
  const mapEvents = (data: any[], sourceName: string): MeetupEvent[] => {
    return data.map((ev: any) => {
      const dateRaw = ev.startDate ? new Date(ev.startDate) : null;
      return {
        title: ev.title || "Événement sans titre",
        link: ev.link || '#',
        startDate: dateRaw!,
        location: ev.location || 'Lieu non spécifié',
        description: ev.description || '',
        dateFormatted: dateRaw ? dateRaw.toLocaleString("fr-FR", {
          weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
        }) : "Date non précisée",
        fullAddress: ev.fullAddress || ev.location || 'Lieu non spécifié',
        image: ev.coverImage || ev.image || PLACEHOLDER_IMAGE,
        categories: ev.categories || [],
        source: sourceName
      } as MeetupEvent;
    });
  };

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      // 1. On lance les deux appels en parallèle pour gagner du temps
      const [resMain, resAtelatoi] = await Promise.all([
        fetch("/api/meetup-events"),
        fetch("/api/atelatoi")
      ]);

      let allEvents: MeetupEvent[] = [];

      // 2. Traitement du flux principal
      if (resMain.ok) {
        const dataMain = await resMain.json();
        if (dataMain.events) {
          allEvents = [...allEvents, ...mapEvents(dataMain.events, "Toulouse Connect")];
        }
      }

      // 3. Traitement du flux Atélatoi (Bordeaux -> Toulouse)
      if (resAtelatoi.ok) {
        const dataAtelatoi = await resAtelatoi.json();
        if (dataAtelatoi.events && dataAtelatoi.events.length > 0) {
          allEvents = [...allEvents, ...mapEvents(dataAtelatoi.events, "Atélatoi")];
        }
      }

      // 4. Tri final par date (toutes sources confondues)
      allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      setEvents(allEvents);
      setFilteredEvents(allEvents);

    } catch (err: any) {
      setError("Erreur lors de la récupération des événements.");
    } finally {
      setLoading(false);
    }
  }

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
      ev.source?.toLowerCase().includes(q) ||
      ev.dateFormatted.toLowerCase().includes(q)
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4">Évènements Meetup Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Prochains événements consolidés (Toulouse + Atélatoi), sur 31 jours.
      </p>

      <input
        type="text"
        placeholder="Rechercher par titre, lieu, source..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:ring focus:border-red-300 outline-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-4">
          <button onClick={() => setViewMode("card")} className={`px-4 py-2 rounded ${viewMode === "card" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
            🗂️ Plein écran
          </button>
          <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
            📋 Vignette
          </button>
        </div>
        
        <Button onClick={fetchEvents} disabled={loading} className="bg-red-600 hover:bg-red-700">
          {loading ? "Chargement..." : "🔄 Rafraîchir"}
        </Button>
      </div>

      <p className="mb-4 font-semibold text-slate-700">Événements affichés : {filteredEvents.length}</p>

      {error && <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded mb-6">{error}</div>}

      {/* Mode plein écran */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <div key={index} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-100">
              <div className="relative aspect-[16/9]">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)} />
                {event.source === "Atélatoi" && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                    Atélatoi
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-2 text-red-700 line-clamp-2">{event.title}</h2>
                <p className="text-sm font-medium mb-1">📍 {event.fullAddress}</p>
                <p className="text-sm text-gray-600 mb-3 font-semibold">{event.dateFormatted}</p>
                <p className="text-sm text-gray-700 mb-4 flex-1 line-clamp-4">{event.description}</p>
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="mt-auto bg-red-600 text-white text-center py-2 rounded hover:bg-red-700 transition font-bold">
                  🔗 Voir l’événement
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode vignette */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg shadow bg-white">
              <img src={event.image} alt={event.title} className="w-20 h-20 object-cover rounded" onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold line-clamp-1">{event.title}</h2>
                  {event.source === "Atélatoi" && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">ATÉLATOI</span>}
                </div>
                <p className="text-xs text-gray-500">{event.dateFormatted} — {event.location}</p>
                <a href={event.link} target="_blank" className="text-red-600 text-sm font-bold hover:underline">Voir l'événement →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <p className="mt-6 text-xl text-gray-500 p-8 border border-dashed rounded-lg text-center">Aucun événement trouvé.</p>
      )}
    </div>
  );
}
