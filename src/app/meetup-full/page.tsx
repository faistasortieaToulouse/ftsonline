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
  coverImage?: string; // Compatibilité Atélatoi
  categories?: string[];
  sourceLabel?: string; 
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
      
      // Tri chronologique indispensable pour la fusion des sources
      const sorted = (data.events || []).sort((a: any, b: any) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      setEvents(sorted);
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
    if (!query) return events;

    return events.filter((ev) => {
      const dateObj = new Date(ev.startDate);
      const dateStr = dateObj.toLocaleString("fr-FR", {
        weekday: "long", day: "numeric", month: "long"
      }).toLowerCase();
      
      return (
        ev.title?.toLowerCase().includes(query) ||
        ev.description?.toLowerCase().includes(query) ||
        ev.location?.toLowerCase().includes(query) ||
        ev.fullAddress?.toLowerCase().includes(query) ||
        dateStr.includes(query)
      );
    });
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-4">Évènements Meetup Toulouse</h1>
      
      <p className="text-muted-foreground mb-6">
        Prochains événements des groupes Meetup toulousains de Loisirs sur 31 jours.
      </p>

      {/* Barre de recherche (Ancien style) */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, catégorie, lieu, date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-red-300"
      />

      {/* Compteur d'événements */}
      <p className="mb-4 font-semibold italic text-gray-600">
        {loading ? "Chargement..." : `Événements affichés : ${filteredEvents.length}`}
      </p>

      {/* Boutons Vue (Ancien style) */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded transition-colors ${viewMode === "card" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          🗂️ Plein écran
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded transition-colors ${viewMode === "list" ? "bg-red-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          📋 Vignette
        </button>
      </div>

      <Button onClick={fetchAllEvents} disabled={loading} className="mb-6 bg-red-600 hover:bg-red-700">
        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} 
        Rafraîchir les événements
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="text-center py-20">
          <Loader2 className="animate-spin mx-auto text-red-600 mb-4" size={40} />
          <p className="text-gray-500">Synchronisation des sources...</p>
        </div>
      ) : (
        <>
          {filteredEvents.length === 0 && !loading && (
            <p className="mt-6 text-xl text-gray-500 p-8 border border-dashed rounded-lg text-center">
              Aucun événement à venir trouvé.
            </p>
          )}

          {/* Mode Plein Écran (Card) */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredEvents.map((ev, index) => {
                const dateFormatted = new Date(ev.startDate).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                });
                const eventImg = ev.image || ev.coverImage || PLACEHOLDER_IMAGE;

                return (
                  <div key={`${ev.link}-${index}`} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-gray-100 relative">
                    {ev.sourceLabel === 'Atélatoi' && (
                      <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md uppercase">
                        ATÉLATOI
                      </div>
                    )}
                    <img
                      src={eventImg}
                      alt={ev.title}
                      className="w-full aspect-[16/9] object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="text-xl font-semibold mb-2 text-red-700 line-clamp-2">{ev.title}</h2>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400" /> {ev.fullAddress || ev.location}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 font-semibold flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" /> {dateFormatted}
                      </p>
                      <p className="text-sm text-gray-700 mb-4 flex-1 line-clamp-4 whitespace-pre-wrap">
                        {ev.description || "Pas de description."}
                      </p>
                      <p className="text-xs text-muted-foreground italic mb-3">Source : {ev.sourceLabel || "Meetup"}</p>
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-block bg-red-600 text-white text-center py-2 px-3 rounded hover:bg-red-700 transition"
                      >
                        🔗 Voir l’événement Meetup
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode Vignette (List) */}
          {viewMode === "list" && (
            <div className="space-y-4 mt-6">
              {filteredEvents.map((ev, index) => {
                const dateFormatted = new Date(ev.startDate).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                });
                const eventImg = ev.image || ev.coverImage || PLACEHOLDER_IMAGE;

                return (
                  <div key={`${ev.link}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg shadow bg-white">
                    <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={eventImg}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold line-clamp-1">{ev.title}</h2>
                        {ev.sourceLabel === 'Atélatoi' && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">Atélatoi</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 italic">{ev.description}</p>
                      <p className="text-sm mt-1 font-medium">📍 {ev.fullAddress || ev.location}</p>
                      <p className="text-sm text-gray-500 font-bold">{dateFormatted}</p>
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 underline text-sm mt-1 block font-bold"
                      >
                        Voir l'événement →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
