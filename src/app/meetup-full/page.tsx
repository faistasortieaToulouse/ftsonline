"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

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
      // Appel de l'API unique qui contient désormais les 86 événements
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

  // Filtrage des événements
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
    <div className="container mx-auto py-10 px-4">
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

      {/* 🔍 Barre de recherche style ancienne version */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un évènement (titre, lieu, description, date...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      {/* 🔄 Bouton refresh rouge */}
      <Button
        onClick={fetchAllEvents}
        disabled={loading}
        className="mb-6 bg-red-600 hover:bg-red-700 text-white font-bold"
      >
        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "🔄"} 
        Rafraîchir les événements
      </Button>

      {/* 🟦 Choix du mode d’affichage style ancienne version */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded transition font-medium ${
            viewMode === "card"
              ? "bg-red-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          🗂️ Plein écran
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded transition font-medium ${
            viewMode === "list"
              ? "bg-red-600 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
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

      {loading && events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-lg">Chargement de l'agenda complet...</p>
        </div>
      ) : (
        <>
          {/* 🟥 MODE PLEIN ÉCRAN (CARD) style ancienne version */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev, index) => {
                const dateFormatted = new Date(ev.startDate).toLocaleString("fr-FR", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <div key={ev.link || index} className="bg-white rounded-xl shadow overflow-hidden border flex flex-col">
                    <img
                      src={ev.image || PLACEHOLDER_IMAGE}
                      alt={ev.title}
                      className="w-full aspect-[16/9] object-cover bg-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="text-xl font-semibold text-red-700 mb-2 line-clamp-2">
                        {ev.title}
                      </h2>
                      <p className="font-medium text-sm mb-1 text-gray-800">📍 {ev.fullAddress || "Toulouse"}</p>
                      <p className="text-gray-600 text-sm mb-3 italic">
                        {dateFormatted}
                      </p>
                      <p className="text-sm mb-4 line-clamp-4 whitespace-pre-wrap text-gray-700 flex-1">
                        {ev.description || "Pas de description disponible."}
                      </p>
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white py-2 px-3 rounded text-center hover:bg-red-700 font-bold transition-colors"
                      >
                        🔗 Voir l'évènement
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🟨 MODE LISTE (VIGNETTE) style ancienne version */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {filteredEvents.map((ev, index) => {
                const dateFormatted = new Date(ev.startDate).toLocaleString("fr-FR", {
                  weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <div key={ev.link || index} className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm hover:border-red-200 transition-colors">
                    <img
                      src={ev.image || PLACEHOLDER_IMAGE}
                      className="w-24 h-24 rounded object-cover flex-shrink-0 bg-gray-100"
                      alt={ev.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-red-700 line-clamp-1">
                        {ev.title}
                      </h2>
                      <p className="text-sm font-medium text-gray-800 truncate">📍 {ev.fullAddress || "Toulouse"}</p>
                      <p className="text-sm text-gray-600">{dateFormatted}</p>
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-red-600 underline font-bold text-sm hover:text-red-800"
                      >
                        Voir l'évènement →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!loading && filteredEvents.length === 0 && (
        <p className="mt-6 text-xl text-gray-500 text-center p-8 border border-dashed rounded bg-gray-50">
          Aucun événement trouvé pour votre recherche.
        </p>
      )}
    </div>
  );
}
