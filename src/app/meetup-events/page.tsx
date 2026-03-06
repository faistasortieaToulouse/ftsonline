'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react"; 

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
  sourceLabel?: string;
};

export default function MeetupEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MeetupEvent[]>([]);
  
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  // États pour la Solution B (Gestion des lots)
  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(0);

  // --- LOGIQUE DE CHARGEMENT PAR LOTS ---
  const loadMeetupLot = useCallback(async (lotIndex: number) => {
    try {
      const res = await fetch(`/api/meetup-events?lot=${lotIndex}`);
      if (!res.ok) return;
      
      const data = await res.json();
      setTotalLots(data.totalLots || 7);

      if (data.events) {
        const newEvents: MeetupEvent[] = data.events.map((ev: any) => {
          const d = new Date(ev.startDate);
          return {
            ...ev,
            startDate: d,
            dateFormatted: d.toLocaleString("fr-FR", {
              weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.coverImage || ev.image || PLACEHOLDER_IMAGE,
            sourceLabel: 'Meetup'
          };
        });

        setEvents(prev => {
          const combined = [...prev, ...newEvents];
          return combined.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        });
      }

      // 🛡️ SÉCURITÉ : Si un lot suivant existe, on attend 2s et on l'appelle
      if (data.nextLot !== null) {
        setCurrentLot(data.nextLot);
        setTimeout(() => loadMeetupLot(data.nextLot), 2000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur lot", lotIndex, err);
    }
  }, []);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);
    setCurrentLot(0);

    try {
      // 1. Charger Atélatoi immédiatement (rapide)
      const resAtelatoi = await fetch("/api/atelatoi");
      if (resAtelatoi.ok) {
        const data = await resAtelatoi.json();
        if (data.events) {
          const mappedAtelatoi = data.events.map((ev: any) => ({
            ...ev,
            startDate: new Date(ev.startDate || ev.date),
            dateFormatted: new Date(ev.startDate || ev.date).toLocaleString("fr-FR", {
               weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.image || PLACEHOLDER_IMAGE,
            sourceLabel: 'Atélatoi'
          }));
          setEvents(prev => [...prev, ...mappedAtelatoi]);
        }
      }

      // 2. Lancer la cascade Meetup (Lot 0)
      loadMeetupLot(0);

    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement.");
      setLoading(false);
    }
  }

  // --- TON FILTRAGE (INCHANGÉ) ---
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

      <h1 className="text-3xl font-bold mb-4">Évènements Meetup Toulouse</h1>
      
      <p className="text-muted-foreground mb-6">
        Prochains événements consolidés des groupes Meetup toulousains (incluant Atélatoi), sur 31 jours.
      </p>

      {/* --- AJOUT : BARRE DE PROGRESSION DISCRÈTE --- */}
      {loading && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col gap-2">
           <div className="flex items-center gap-2 text-red-700 text-sm font-bold">
             <Loader2 size={16} className="animate-spin" />
             Mise à jour des événements en cours... (Lot {currentLot + 1} / {totalLots || 7})
           </div>
           <div className="w-full bg-red-200 h-1.5 rounded-full overflow-hidden">
             <div 
               className="bg-red-600 h-full transition-all duration-500" 
               style={{ width: `${((currentLot + 1) / (totalLots || 7)) * 100}%` }}
             ></div>
           </div>
        </div>
      )}

      {/* --- LA SUITE DE TON CODE (INPUT, BOUTONS, GRILLE) RESTE STRICTEMENT IDENTIQUE --- */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, catégorie, lieu, date..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-red-300"
      />

      <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setViewMode("card")} className={`px-4 py-2 rounded ${viewMode === "card" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
          🗂️ Plein écran
        </button>
        <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-200"}`}>
          📋 Vignette
        </button>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6 bg-red-600 hover:bg-red-700">
        {loading ? "Chargement des lots..." : "🔄 Rafraîchir les événements"}
      </Button>

      {/* ... Le reste de tes rendus Card/List (inchangés) ... */}
      {viewMode === "card" && filteredEvents.length > 0 && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
           {filteredEvents.map((event, index) => (
             <div key={index} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-100 relative">
               {event.sourceLabel === 'Atélatoi' && (
                 <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
                   ATÉLATOI
                 </div>
               )}
               <img
                 src={event.image}
                 alt={event.title}
                 className="w-full aspect-[16/9] object-cover"
                 onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
               />
               <div className="p-4 flex flex-col flex-1">
                 <h2 className="text-xl font-semibold mb-2 text-red-700">{event.title}</h2>
                 <p className="text-sm font-medium mb-1">📍 {event.fullAddress}</p>
                 <p className="text-sm text-gray-600 mb-3 font-semibold">{event.dateFormatted}</p>
                 <p className="text-sm text-gray-700 mb-2 flex-1 line-clamp-4 whitespace-pre-wrap">{event.description}</p>
                 <a
                   href={event.link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="mt-auto inline-block bg-red-600 text-white text-center py-2 px-3 rounded hover:bg-red-700 transition"
                 >
                   🔗 Voir l’événement Meetup
                 </a>
               </div>
             </div>
           ))}
         </div>
      )}

      {/* ... Idem pour le mode List ... */}
      {viewMode === "list" && filteredEvents.length > 0 && (
        <div className="space-y-4 mt-6">
          {filteredEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg shadow bg-white">
              <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold line-clamp-2">{event.title}</h2>
                  {event.sourceLabel === 'Atélatoi' && (
                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">Atélatoi</span>
                  )}
                </div>
                <p className="text-sm mt-1 font-medium">📍 {event.fullAddress}</p>
                <p className="text-sm text-gray-500">{event.dateFormatted}</p>
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-red-600 underline text-sm mt-1 block font-bold">
                  Voir l'événement →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
