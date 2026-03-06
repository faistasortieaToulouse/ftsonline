'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Calendar } from "lucide-react"; 

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop"; // Image plus qualitative

type MeetupEvent = {
  title: string;
  link: string;
  startDate: Date;          
  location: string; 
  description: string;      
  dateFormatted: string;   
  fullAddress: string;     
  image?: string;           
  sourceLabel?: string;
};

export default function MeetupEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(7);

  // --- LOGIQUE DE DÉDOUBLONNAGE CLIENT AMÉLIORÉE ---
  const addEventsUnique = useCallback((newEvents: any[]) => {
    setEvents(prev => {
      const combined = [...prev, ...newEvents];
      const uniqueMap = new Map<string, MeetupEvent>();
      
      combined.forEach(ev => {
        // Clé unique identique à l'API (Titre + Date ISO)
        const dateStr = ev.startDate instanceof Date ? ev.startDate.toISOString() : ev.startDate;
        const key = `${ev.title.toLowerCase().trim()}-${dateStr}`;
        
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, ev);
        } else {
          // Si on a un doublon, on garde celui qui a une image
          const existing = uniqueMap.get(key);
          if (!existing?.image?.includes('placeholder') && ev.image && !ev.image.includes('placeholder')) {
             uniqueMap.set(key, ev);
          }
        }
      });

      return Array.from(uniqueMap.values()).sort((a, b) => 
        a.startDate.getTime() - b.startDate.getTime()
      );
    });
  }, []);

  const loadMeetupLot = useCallback(async (lotIndex: number) => {
    try {
      const res = await fetch(`/api/meetup-events?lot=${lotIndex}`);
      if (!res.ok) throw new Error("Erreur réseau");
      
      const data = await res.json();
      setTotalLots(data.totalLots || 7);

      if (data.events && data.events.length > 0) {
        const mapped = data.events.map((ev: any) => {
          const d = new Date(ev.startDate);
          return {
            ...ev,
            startDate: d,
            dateFormatted: d.toLocaleString("fr-FR", {
              weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.coverImage || PLACEHOLDER_IMAGE,
            sourceLabel: 'Meetup'
          };
        });
        addEventsUnique(mapped);
      }

      if (data.nextLot !== null) {
        setCurrentLot(data.nextLot);
        // Délai pour laisser respirer l'API et éviter les blocages d'images
        setTimeout(() => loadMeetupLot(data.nextLot), 800);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur lot", lotIndex, err);
      setLoading(false);
    }
  }, [addEventsUnique]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    setEvents([]);
    setCurrentLot(0);

    try {
      // 1. Atélatoi
      const resAtelatoi = await fetch("/api/atelatoi");
      if (resAtelatoi.ok) {
        const data = await resAtelatoi.json();
        if (data.events) {
          const mapped = data.events.map((ev: any) => ({
            ...ev,
            startDate: new Date(ev.startDate || ev.date),
            dateFormatted: new Date(ev.startDate || ev.date).toLocaleString("fr-FR", {
               weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.image || PLACEHOLDER_IMAGE,
            sourceLabel: 'Atélatoi'
          }));
          addEventsUnique(mapped);
        }
      }
      // 2. Meetup
      loadMeetupLot(0);
    } catch (err) {
      setError("Impossible de charger les événements.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // Filtrage optimisé
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return events;
    return events.filter(ev =>
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">L'Agenda Toulousain</h1>
          <p className="text-muted-foreground">Les 31 prochains jours de sorties consolidées.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode("card")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "card" ? "bg-white shadow-sm text-red-600" : "text-gray-500"}`}>Grille</button>
          <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "list" ? "bg-white shadow-sm text-red-600" : "text-gray-500"}`}>Liste</button>
        </div>
      </div>

      {loading && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl">
           <div className="flex items-center gap-3 text-red-700 font-semibold mb-3">
             <Loader2 size={20} className="animate-spin" />
             Synchronisation des groupes... ({currentLot + 1} / {totalLots})
           </div>
           <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
             <div className="bg-red-600 h-full transition-all duration-700" style={{ width: `${((currentLot + 1) / totalLots) * 100}%` }}></div>
           </div>
        </div>
      )}

      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Filtrer par titre, lieu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:outline-none transition-all shadow-sm text-lg"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
      </div>

      {filteredEvents.length === 0 && !loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
          <p className="text-gray-500 text-lg">Aucun événement trouvé pour votre recherche.</p>
          <Button onClick={() => setSearchQuery("")} variant="link" className="text-red-600">Effacer les filtres</Button>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {filteredEvents.map((event, idx) => (
            <div key={event.link || idx} className={`${viewMode === "card" ? "flex flex-col h-full bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl" : "flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl"} transition-all duration-300 overflow-hidden group`}>
              
              <div className={viewMode === "card" ? "relative aspect-[16/9] w-full" : "relative w-24 h-24 shrink-0"}>
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
                {event.sourceLabel === 'Atélatoi' && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">ATÉLATOI</span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className={`font-bold text-gray-900 mb-2 leading-tight ${viewMode === "card" ? "text-xl line-clamp-2" : "text-base truncate"}`}>{event.title}</h2>
                
                <div className="flex flex-col gap-1.5 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><MapPin size={14} className="text-red-500" /> <span className="truncate">{event.location}</span></div>
                  <div className="flex items-center gap-2 font-medium text-gray-800"><Calendar size={14} className="text-red-500" /> <span>{event.dateFormatted}</span></div>
                </div>

                {viewMode === "card" && (
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6 italic">{event.description?.substring(0, 150)}...</p>
                )}

                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${viewMode === "card" ? "mt-auto w-full py-3" : "px-6 py-2 ml-auto"} bg-red-600 text-white text-center rounded-xl font-bold hover:bg-red-700 transition shadow-md hover:shadow-lg`}
                >
                  {viewMode === "card" ? "Réserver ma place" : "Détails"}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
