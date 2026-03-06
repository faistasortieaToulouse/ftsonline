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

  // Filtrage intelligent : inclut titre, description, lieu et date formatée
  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return events;

    return events.filter((ev) => {
      const dateObj = new Date(ev.startDate);
      const dateStr = dateObj.toLocaleString("fr-FR", {
        weekday: "long", day: "numeric", month: "long"
      }).toLowerCase();
      
      return (
        ev.title?.toLowerCase().includes(query) ||
        ev.description?.toLowerCase().includes(query) ||
        ev.fullAddress?.toLowerCase().includes(query) ||
        dateStr.includes(query)
      );
    });
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      {/* Navigation */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* Header avec Compteur dynamique */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">Agenda Complet Toulouse</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar size={18} className="text-red-600" />
            {loading ? "Mise à jour..." : `${filteredEvents.length} événements à l'affiche`}
          </p>
        </div>
        
        <Button 
          onClick={fetchAllEvents} 
          disabled={loading} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} 
          Actualiser l'agenda
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Filtrer par mot-clé, lieu ou date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Sélecteur de vue stylisé */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl w-fit border border-gray-200">
        <button
          onClick={() => setViewMode("card")}
          className={`px-5 py-2 rounded-lg font-bold transition-all ${
            viewMode === "card" ? "bg-white shadow-md text-red-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🗂️ Grille
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-5 py-2 rounded-lg font-bold transition-all ${
            viewMode === "list" ? "bg-white shadow-md text-red-600" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Liste
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 border-l-4 border-red-500 bg-red-50 text-red-700 rounded-r-xl animate-in fade-in slide-in-from-left-2">
          <p className="font-bold">Oups !</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Chargement & Grille */}
      {loading && events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 className="animate-spin mb-6 text-red-600" size={56} />
          <p className="text-xl font-medium">Synchronisation des événements...</p>
          <p className="text-sm italic">Recherche parmi les sources de Toulouse</p>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
          {filteredEvents.map((ev, index) => {
            const dateObj = new Date(ev.startDate);
            const dateFormatted = dateObj.toLocaleString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
            });

            return viewMode === "card" ? (
              /* Vue Carte */
              <div key={`${ev.link}-${index}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  <img 
                    src={ev.image || PLACEHOLDER_IMAGE} 
                    alt={ev.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-red-600 shadow-sm">
                    Toulouse
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-lg font-extrabold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-snug">{ev.title}</h2>
                  <p className="text-xs text-red-600 font-black mb-4 uppercase tracking-widest">{dateFormatted}</p>
                  <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    {ev.description || "Pas de description détaillée pour cet événement."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 pb-5 border-b border-gray-50">
                    <MapPin size={14} className="shrink-0 text-red-400" />
                    <span className="truncate font-medium">{ev.fullAddress}</span>
                  </div>
                  <a 
                    href={ev.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-red-600 text-white rounded-xl text-center font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-red-200"
                  >
                    Voir l'évènement <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ) : (
              /* Vue Liste (Vignette) */
              <div key={`${ev.link}-${index}`} className="group flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-md transition-all items-center shadow-sm">
                <img 
                  src={ev.image || PLACEHOLDER_IMAGE} 
                  className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover shrink-0 bg-gray-50" 
                  alt="" 
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                />
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h2 className="font-extrabold text-gray-900 truncate text-lg group-hover:text-red-600 transition-colors">{ev.title}</h2>
                  <p className="text-sm text-red-600 font-bold mt-1 uppercase tracking-tight">{dateFormatted}</p>
                  <p className="text-xs text-gray-400 truncate mt-2 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin size={12} /> {ev.fullAddress}
                  </p>
                </div>
                <a 
                  href={ev.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all text-sm shrink-0 flex items-center justify-center gap-2"
                >
                  Détails <ExternalLink size={14} />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* État Vide */}
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-32 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Search size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-500 text-xl font-bold">Aucun résultat trouvé</p>
          <p className="text-gray-400 mt-1">Essayez de modifier vos termes de recherche.</p>
          <Button variant="link" onClick={() => setSearch("")} className="mt-4 text-red-600 font-bold">
            Effacer la recherche
          </Button>
        </div>
      )}
    </div>
  );
}
