'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Calendar } from "lucide-react"; 

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop";

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
  const [search, setSearch] = useState(""); 
  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(7);

  // --- LOGIQUE DE DÉDOUBLONNAGE INTELLIGENTE ---
  const addEventsUnique = useCallback((newEvents: any[]) => {
    setEvents(prev => {
      const combined = [...prev, ...newEvents];
      const uniqueMap = new Map<string, MeetupEvent>();
      
      combined.forEach(ev => {
        const dateStr = ev.startDate instanceof Date ? ev.startDate.toISOString() : new Date(ev.startDate).toISOString();
        // Clé unique basée sur le titre et la date
        const key = `${ev.title.toLowerCase().trim()}-${dateStr}`;
        
        const existing = uniqueMap.get(key);
        // On vérifie si l'image actuelle est un placeholder ou vide
        const hasRealImage = ev.image && !ev.image.includes('placeholder');

        if (!existing || (!existing.image?.includes('http') || (!existing.image.includes('unsplash') && hasRealImage))) {
          uniqueMap.set(key, ev);
        }
      });

      return Array.from(uniqueMap.values()).sort((a, b) => 
        a.startDate.getTime() - b.startDate.getTime()
      );
    });
  }, []);

  // --- CHARGEMENT PAR LOTS ---
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
            // On utilise coverImage si présent, sinon image, sinon placeholder
            image: ev.coverImage || ev.image || PLACEHOLDER_IMAGE,
            fullAddress: ev.fullAddress || ev.location || "Toulouse",
          };
        });
        addEventsUnique(mapped);
      }

      if (data.nextLot !== null) {
        setCurrentLot(data.nextLot);
        setTimeout(() => loadMeetupLot(data.nextLot), 800);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }, [addEventsUnique]);

  const fetchAllEvents = async () => {
    setLoading(true);
    setError(null);
    setEvents([]);
    setCurrentLot(0);

    try {
      // 1. Appel Atélatoi (souvent plus riche en images)
      const resAtelatoi = await fetch("/api/atelatoi");
      if (resAtelatoi.ok) {
        const data = await resAtelatoi.json();
        if (data.events) {
          const mapped = data.events.map((ev: any) => {
            const d = new Date(ev.startDate);
            return {
              ...ev,
              startDate: d,
              dateFormatted: d.toLocaleString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
              }),
              image: ev.coverImage || ev.image || PLACEHOLDER_IMAGE,
              fullAddress: ev.fullAddress || ev.location,
              sourceLabel: 'Atélatoi'
            };
          });
          addEventsUnique(mapped);
        }
      }
      // 2. Lancement des lots Meetup
      loadMeetupLot(0);
    } catch (err) {
      setError("Erreur lors du chargement.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllEvents(); }, []);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return events;
    return events.filter(ev => {
      const text = `${ev.title} ${ev.description} ${ev.fullAddress}`.toLowerCase();
      const dateText = ev.dateFormatted.toLowerCase();
      return text.includes(query) || dateText.includes(query);
    });
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        Tous les événements Meetup Toulouse
      </h1>

      <p className="text-muted-foreground mb-6">
        Fusion des groupes Meetup de loisirs — {filteredEvents.length} évènement(s)
      </p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un évènement (titre, lieu, description, date...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <Button
          onClick={fetchAllEvents}
          disabled={loading}
          className="w-fit bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} Rafraîchir les événements
        </Button>
        {loading && (
           <div className="w-full max-w-md">
             <p className="text-xs text-red-600 font-bold mb-1 uppercase">
               Synchronisation : Lot {currentLot + 1} / {totalLots}
             </p>
             <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
               <div 
                 className="bg-red-600 h-full transition-all duration-500" 
                 style={{ width: `${((currentLot + 1) / totalLots) * 100}%` }}
               ></div>
             </div>
           </div>
        )}
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setViewMode("card")}
          className={`px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
            viewMode === "card" ? "bg-red-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🗂️ Plein écran
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
            viewMode === "list" ? "bg-red-600 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📋 Vignette
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 border-l-4 border-red-500 bg-red-50 text-red-700">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev, index) => (
            <div key={ev.link || index} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={ev.image} 
                  alt={ev.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }} 
                />
                {ev.sourceLabel === 'Atélatoi' && (
                  <span className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-md font-black shadow-sm">ATÉLATOI</span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">{ev.title}</h2>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2 truncate"><MapPin size={14} className="text-red-500" /> {ev.fullAddress}</p>
                  <p className="text-sm text-gray-700 font-semibold flex items-center gap-2"><Calendar size={14} className="text-red-500" /> {ev.dateFormatted}</p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-6 italic flex-1">{ev.description}</p>
                <a href={ev.link} target="_blank" className="mt-auto block w-full bg-red-600 text-white py-3 rounded-xl text-center font-bold hover:bg-red-700 transition-colors">
                  Voir l’événement
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredEvents.map((ev, index) => (
            <div key={ev.link || index} className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-2xl bg-white shadow-sm hover:border-red-200 transition-colors">
              <img 
                src={ev.image} 
                className="w-full sm:w-24 h-32 sm:h-24 rounded-xl object-cover flex-shrink-0" 
                alt={ev.title} 
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-bold text-red-700 truncate">{ev.title}</h2>
                <p className="text-sm font-medium text-gray-700">📍 {ev.fullAddress}</p>
                <p className="text-sm text-gray-500 font-bold">{ev.dateFormatted}</p>
                <a href={ev.link} target="_blank" className="mt-2 text-red-600 underline text-sm font-bold hover:text-red-800">Voir l'événement →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="mt-12 text-center p-12 border-2 border-dashed rounded-3xl bg-gray-50">
          <p className="text-xl text-gray-500 font-medium">Aucun événement ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
