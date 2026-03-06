'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"; 
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Calendar } from "lucide-react"; 

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
  sourceLabel?: string;
};

export default function MeetupEventsPage() { 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [search, setSearch] = useState(""); // Nom d'état synchronisé avec votre demande
  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(7);

  // --- LOGIQUE DE DÉDOUBLONNAGE ---
  const addEventsUnique = useCallback((newEvents: any[]) => {
    setEvents(prev => {
      const combined = [...prev, ...newEvents];
      const uniqueMap = new Map<string, MeetupEvent>();
      
      combined.forEach(ev => {
        const dateStr = ev.startDate instanceof Date ? ev.startDate.toISOString() : ev.startDate;
        const key = `${ev.title.toLowerCase().trim()}-${dateStr}`;
        
        if (!uniqueMap.has(key)) {
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
              weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.coverImage || PLACEHOLDER_IMAGE,
            fullAddress: ev.fullAddress || ev.location,
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
      const resAtelatoi = await fetch("/api/atelatoi");
      if (resAtelatoi.ok) {
        const data = await resAtelatoi.json();
        if (data.events) {
          const mapped = data.events.map((ev: any) => ({
            ...ev,
            startDate: new Date(ev.startDate || ev.date),
            dateFormatted: new Date(ev.startDate || ev.date).toLocaleString("fr-FR", {
              weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            }),
            image: ev.image || PLACEHOLDER_IMAGE,
            fullAddress: ev.location,
            sourceLabel: 'Atélatoi'
          }));
          addEventsUnique(mapped);
        }
      }
      loadMeetupLot(0);
    } catch (err) {
      setError("Erreur lors du chargement.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllEvents(); }, []);

  // --- FILTRAGE ---
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
    <div className="container mx-auto py-10 px-4">
      {/* NAVIGATION EXACTE */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* TITRES EXACTS */}
      <h1 className="text-3xl font-bold mb-2">
        Tous les événements Meetup Toulouse
      </h1>

      <p className="text-muted-foreground mb-6">
        Fusion des groupes Meetup de loisirs — {filteredEvents.length} évènement(s)
      </p>

      {/* BARRE DE RECHERCHE EXACTE */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un évènement (titre, lieu, description, date...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>

      {/* BOUTON REFRESH AVEC PROGRESSION */}
      <div className="flex flex-col gap-2 mb-6">
        <Button
          onClick={fetchAllEvents}
          disabled={loading}
          className="w-fit bg-red-600 hover:bg-red-700"
        >
          {loading ? "Chargement..." : "🔄 Rafraîchir les événements"}
        </Button>
        {loading && (
           <p className="text-sm text-red-600 animate-pulse font-medium">
             Synchronisation des groupes : Lot {currentLot + 1} / {totalLots}
           </p>
        )}
      </div>

      {/* MODES D'AFFICHAGE EXACTS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded transition ${
            viewMode === "card" ? "bg-red-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          🗂️ Plein écran
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded transition ${
            viewMode === "list" ? "bg-red-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📋 Vignette
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 border border-red-500 bg-red-50 text-red-700 rounded">
          Erreur : {error}
        </div>
      )}

      {/* RENDU DES CARTES (MODE PLEIN ÉCRAN) */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev, index) => (
            <div key={ev.link || index} className="bg-white rounded-xl shadow overflow-hidden border flex flex-col h-full">
              <div className="relative">
                <img src={ev.image} alt={ev.title} className="w-full aspect-[16/9] object-cover" />
                {ev.sourceLabel === 'Atélatoi' && (
                  <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">ATÉLATOI</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-red-700 mb-2 line-clamp-2">{ev.title}</h2>
                <p className="font-medium text-sm mb-1">📍 {ev.fullAddress}</p>
                <p className="text-gray-600 text-sm mb-3">{ev.dateFormatted}</p>
                <p className="text-sm mb-3 line-clamp-4 whitespace-pre-wrap">{ev.description}</p>
                <a href={ev.link} target="_blank" className="mt-auto bg-red-600 text-white py-2 px-3 rounded text-center hover:bg-red-700 transition">
                  🔗 Voir l’événement
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDU LISTE (MODE VIGNETTE) */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((ev, index) => (
            <div key={ev.link || index} className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm">
              <img src={ev.image} className="w-24 h-24 rounded object-cover flex-shrink-0" alt={ev.title} />
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-red-700 truncate">{ev.title}</h2>
                <p className="text-sm font-medium">📍 {ev.fullAddress}</p>
                <p className="text-sm text-gray-600">{ev.dateFormatted}</p>
                <a href={ev.link} target="_blank" className="mt-2 text-red-600 underline text-sm font-bold">Voir →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <p className="mt-6 text-xl text-gray-500 text-center p-8 border border-dashed rounded">
          Aucun événement trouvé.
        </p>
      )}
    </div>
  );
}
