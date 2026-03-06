"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800";

type MeetupEvent = {
  title: string;
  link: string;
  startDate: string; // ISO string venant de l'API
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
      // On appelle l'API d'agrégation que nous avons créée
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

  // Filtrage performant avec useMemo
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
          <h1 className="text-4xl font-extrabold mb-2 text-gray-900">Agenda Complet</h1>
          <p className="text-muted-foreground">
            {loading ? "Chargement de la base complète..." : `${filteredEvents.length} événements synchronisés à Toulouse`}
          </p>
        </div>
        
        <Button 
          onClick={fetchAllEvents} 
          disabled={loading} 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} 
          Actualiser la liste
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher par titre, lieu, date ou mot-clé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Switcher de vue */}
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
          <p className="text-lg font-medium">Récupération des 75+ événements...</p>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredEvents.map((ev, index) => {
            const dateObj = new Date(ev.startDate);
            const dateFormatted = dateObj.toLocaleString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
            });

            return viewMode === "card" ? (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <img src={ev.image || PLACEHOLDER_IMAGE} alt={ev.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{ev.title}</h2>
                  <p className="text-sm text-red-600 font-semibold mb-1 uppercase tracking-wider">{dateFormatted}</p>
                  <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3 italic">{ev.description}</p>
                  <a href={ev.link} target="_blank" className="w-full py-3 bg-gray-900 text-white rounded-xl text-center font-bold hover:bg-red-600 transition-colors">
                    S'inscrire
                  </a>
                </div>
              </div>
            ) : (
              <div key={index} className="flex gap-4 p-4 bg-white border rounded-xl hover:border-red-200 transition-colors items-center">
                <img src={ev.image || PLACEHOLDER_IMAGE} className="w-20 h-20 rounded-lg object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 truncate">{ev.title}</h2>
                  <p className="text-sm text-red-600 font-medium">{dateFormatted}</p>
                  <p className="text-xs text-gray-500 truncate">📍 {ev.fullAddress}</p>
                </div>
                <a href={ev.link} target="_blank" className="px-4 py-2 border-2 border-gray-900 rounded-lg font-bold hover:bg-gray-900 hover:text-white transition-all text-sm">
                  Détails
                </a>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
          <p className="text-gray-400 text-xl italic">Aucun événement trouvé pour "{search}"</p>
        </div>
      )}
    </div>
  );
}
