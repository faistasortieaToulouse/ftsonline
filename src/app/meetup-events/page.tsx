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

  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(0);

  // --- LOGIQUE DE CHARGEMENT PAR LOTS (CORRIGÉE POUR DOUBLONS) ---
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
            sourceLabel: ev.sourceLabel || 'Meetup'
          };
        });

        // 🛡️ FILTRAGE DES DOUBLONS CÔTÉ CLIENT
        setEvents(prev => {
          const combined = [...prev, ...newEvents];
          const uniqueMap = new Map<string, MeetupEvent>();
          
          combined.forEach(ev => {
            // On utilise le lien (URL) comme identifiant unique
            if (!uniqueMap.has(ev.link)) {
              uniqueMap.set(ev.link, ev);
            }
          });

          return Array.from(uniqueMap.values()).sort((a, b) => 
            a.startDate.getTime() - b.startDate.getTime()
          );
        });
      }

      if (data.nextLot !== null) {
        setCurrentLot(data.nextLot);
        setTimeout(() => loadMeetupLot(data.nextLot), 1500); // Réduit à 1.5s pour plus de fluidité
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
      // 1. Charger Atélatoi
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

      // 2. Lancer la cascade Meetup
      loadMeetupLot(0);

    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement.");
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

      <input
        type="text"
        placeholder="Rechercher par titre, description, lieu, date..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-red-300"
      />

      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-gray-700">Événements affichés : {filteredEvents.length}</p>
        <div className="flex gap-2">
          <button onClick={() => setViewMode("card")} className={`px-3 py-1.5 text-sm rounded transition ${viewMode === "card" ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
            🗂️ Plein écran
          </button>
          <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-sm rounded transition ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
            📋 Vignette
          </button>
        </div>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-8 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
        {loading ? "Chargement en cours..." : "🔄 Rafraîchir la liste"}
      </Button>

      {/* Rendu Grille (Card) */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, idx) => (
            <div key={event.link || idx} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 relative group hover:shadow-xl transition-shadow">
              {event.sourceLabel === 'Atélatoi' && (
                <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
                  ATÉLATOI
                </div>
              )}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-lg font-bold mb-2 text-red-700 line-clamp-2 leading-tight">{event.title}</h2>
                <div className="space-y-1 mb-3">
                  <p className="text-xs font-medium text-gray-800">📍 {event.location}</p>
                  <p className="text-xs text-gray-600 font-semibold">{event.dateFormatted}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 italic">
                  {event.description?.substring(0, 120)}...
                </p>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block w-full bg-red-600 text-white text-center py-2 rounded font-bold hover:bg-red-700 transition"
                >
                  Voir sur Meetup
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rendu Liste */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((event, idx) => (
            <div key={event.link || idx} className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:bg-gray-50 transition">
              <div className="w-20 h-20 shrink-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover rounded shadow-sm"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900 truncate">{event.title}</h2>
                  {event.sourceLabel === 'Atélatoi' && (
                    <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">Atélatoi</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">📍 {event.fullAddress}</p>
                <p className="text-xs font-medium text-red-600">{event.dateFormatted}</p>
              </div>
              <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-red-600 whitespace-nowrap p-2 hover:underline">
                Détails →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
