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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLot, setCurrentLot] = useState(0);
  const [totalLots, setTotalLots] = useState(7);

  // --- LOGIQUE DE DÉDOUBLONNAGE ET TRI ---
  const addEventsUnique = useCallback((newEvents: any[]) => {
    setEvents(prev => {
      const combined = [...prev, ...newEvents];
      const uniqueMap = new Map<string, MeetupEvent>();
      
      combined.forEach(ev => {
        const dateStr = ev.startDate instanceof Date ? ev.startDate.toISOString() : ev.startDate;
        const key = `${ev.title.toLowerCase().trim()}-${dateStr}`;
        
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, ev);
        } else {
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
      loadMeetupLot(0);
    } catch (err) {
      setError("Impossible de charger les événements.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return events;
    return events.filter(ev =>
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.dateFormatted.toLowerCase().includes(q)
    );
  }, [searchQuery, events]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* NAVIGATION */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-2">L'Agenda Toulousain</h1>
      
      <p className="text-muted-foreground mb-6">
        Fusion des groupes Meetup de loisirs — {filteredEvents.length} évènement(s)
      </p>

      {/* BARRE DE RECHERCHE */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Rechercher un évènement (titre, lieu, description, date...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
      </div>

      {/* BOUTON REFRESH / LOADER DE SYNCHRO */}
      <div className="flex flex-col gap-4 mb-6">
        <Button
          onClick={fetchEvents}
          disabled={loading}
          className="w-fit bg-red-600 hover:bg-red-700"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Synchronisation...</span>
          ) : "🔄 Rafraîchir les événements"}
        </Button>

        {loading && (
          <div className="w-full max-w-md bg-red-50 p-3 rounded-lg border border-red-100">
            <p className="text-xs text-red-700 font-semibold mb-2">Chargement lot {currentLot + 1} sur {totalLots}...</p>
            <div className="w-full bg-red-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${((currentLot + 1) / totalLots) * 100}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {/* CHOIX DU MODE D'AFFICHAGE */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded transition flex items-center gap-2 ${
            viewMode === "card" ? "bg-red-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          🗂️ Plein écran
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded transition flex items-center gap-2 ${
            viewMode === "list" ? "bg-red-600 text-white shadow" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          📋 Vignette
        </button>
      </div>

      {/* COMPTEUR DYNAMIQUE (LE BLOC QUE VOUS VOULIEZ) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
            {filteredEvents.length}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {filteredEvents.length > 1 ? "Événements trouvés" : "Événement trouvé"}
            </h3>
            <p className="text-sm text-gray-500">
              {loading ? `Synchronisation en cours...` : "Tous les groupes sont à jour"}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Période</p>
          <p className="text-sm font-bold text-gray-700">31 prochains jours</p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 border border-red-500 bg-red-50 text-red-700 rounded">
          Erreur : {error}
        </div>
      )}

      {/* AFFICHAGE DES ÉVÉNEMENTS */}
      {filteredEvents.length === 0 && !loading ? (
        <p className="mt-6 text-xl text-gray-500 text-center p-8 border border-dashed rounded">
          Aucun événement trouvé.
        </p>
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev, index) => (
                <div key={ev.link || index} className="bg-white rounded-xl shadow overflow-hidden border flex flex-col h-full group hover:shadow-lg transition-all">
                  <div className="relative">
                    <img src={ev.image} alt={ev.title} className="w-full aspect-[16/9] object-cover" />
                    {ev.sourceLabel === 'Atélatoi' && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold">ATÉLATOI</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-xl font-semibold text-red-700 mb-2 line-clamp-2">{ev.title}</h2>
                    <p className="font-medium text-sm mb-1">📍 {ev.location}</p>
                    <p className="text-gray-600 text-sm mb-3 font-medium">{ev.dateFormatted}</p>
                    <p className="text-sm mb-6 line-clamp-4 text-gray-500 italic">{ev.description}</p>
                    <a href={ev.link} target="_blank" className="mt-auto bg-red-600 text-white py-2 px-3 rounded text-center hover:bg-red-700 font-bold transition">
                      🔗 Voir l’événement
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((ev, index) => (
                <div key={ev.link || index} className="flex items-center gap-4 p-3 border rounded-lg bg-white shadow-sm hover:border-red-200 transition">
                  <img src={ev.image} className="w-24 h-24 rounded object-cover flex-shrink-0" alt={ev.title} />
                  <div className="flex flex-col flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-red-700 truncate">{ev.title}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                       <span className="flex items-center gap-1"><MapPin size={14} /> {ev.location}</span>
                       <span className="flex items-center gap-1 font-medium"><Calendar size={14} /> {ev.dateFormatted}</span>
                    </div>
                    <a href={ev.link} target="_blank" className="mt-2 text-red-600 underline font-bold text-sm">Voir l'évènement →</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
