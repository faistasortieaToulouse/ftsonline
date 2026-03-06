"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, MapPin, Calendar, ExternalLink } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800";

type MeetupEvent = {
  title: string;
  link: string;
  startDate: string;
  location: string;
  description: string;
  fullAddress: string;
  image?: string;
};

export default function MeetupFullPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MeetupEvent[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const fetchAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meetup-full");
      if (!res.ok) throw new Error("Erreur lors de la récupération des données");
      
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();
    return events.filter((ev) => {
      const dateStr = new Date(ev.startDate).toLocaleString("fr-FR", {
        weekday: "long", day: "numeric", month: "long"
      }).toLowerCase();
      
      return (
        ev.title.toLowerCase().includes(query) ||
        ev.description.toLowerCase().includes(query) ||
        ev.fullAddress.toLowerCase().includes(query) ||
        dateStr.includes(query)
      );
    });
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:underline font-bold transition-all">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Agenda Complet</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar size={16} />
            {loading ? "Chargement..." : `${filteredEvents.length} événements à venir à Toulouse`}
          </p>
        </div>
        
        <Button 
          onClick={fetchAllEvents} 
          disabled={loading} 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50 font-bold"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} 
          Actualiser
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par titre, lieu, date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded-md font-medium transition ${viewMode === "card" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          🗂️ Grille
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-md font-medium transition ${viewMode === "list" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          📋 Liste
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 border-l-4 border-red-500 bg-red-50 text-red-700 rounded-r-lg">
          {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-lg font-medium tracking-wide text-center">Synchronisation des sources...<br/><span className="text-sm font-normal">Cela peut prendre quelques secondes.</span></p>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredEvents.map((ev, index) => {
            const dateObj = new Date(ev.startDate);
            const dateFormatted = dateObj.toLocaleString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
            });

            return viewMode === "card" ? (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-video bg-gray-200">
                  <img 
                    src={ev.image || PLACEHOLDER_IMAGE} 
                    alt={ev.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{ev.title}</h2>
                  <p className="text-xs text-red-600 font-bold mb-3 uppercase tracking-wider">{dateFormatted}</p>
                  <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3 italic">
                    {ev.description || "Aucune description fournie."}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{ev.fullAddress}</span>
                  </div>
                  <a 
                    href={ev.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-red-600 text-white rounded-xl text-center font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Voir l'évènement <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <div key={index} className="flex gap-4 p-4 bg-white border rounded-xl hover:border-red-200 transition-all items-center shadow-sm">
                <img 
                  src={ev.image || PLACEHOLDER_IMAGE} 
                  className="w-20 h-20 rounded-lg object-cover shrink-0 bg-gray-100" 
                  alt="" 
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{ev.title}</h2>
                  <p className="text-sm text-red-600 font-medium">{dateFormatted}</p>
                  <p className="text-xs text-gray-400 truncate mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {ev.fullAddress}
                  </p>
                </div>
                <a 
                  href={ev.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-sm shrink-0 flex items-center gap-2"
                >
                  Voir l'évènement
                </a>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-gray-50">
          <p className="text-gray-400 text-xl italic">Aucun événement trouvé pour "{search}"</p>
        </div>
      )}
    </div>
  );
}
