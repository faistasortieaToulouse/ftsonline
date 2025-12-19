"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "/api/discord";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x450?text=Événement+Discord";
const DISCORD_EVENT_URL = "https://discord.com/channels/1422806103267344416/1423210600036565042";

// On utilise le type harmonisé envoyé par votre API corrigée
type DiscordEvent = {
  id: string;
  title: string;       // au lieu de name
  description?: string;
  date: string;        // au lieu de scheduled_start_time
  dateFormatted?: string;
  image?: string | null;
  location?: string;
  source?: string;
};

export default function DiscordEventsPage() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Sécurité : on s'assure que data.events existe
      setEvents(data.events ?? []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events
    .filter((event) => {
      const query = searchQuery.toLowerCase();
      return (
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Fonction de secours pour l'affichage de la date
  const formatDate = (event: DiscordEvent) => {
    if (event.dateFormatted) return event.dateFormatted;
    const d = new Date(event.date);
    return isNaN(d.getTime()) ? "Date à venir" : d.toLocaleString("fr-FR");
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">Événements Discord</h1>
      <p className="text-muted-foreground mb-6">
        Liste des événements Discord du serveur.
      </p>

      <input
        type="text"
        placeholder="Rechercher par nom ou description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-sm">
          Événements affichés : {filteredEvents.length}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"} size="sm">📺 Card</Button>
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"} size="sm">🔲 List</Button>
        </div>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6 w-full sm:w-auto">
        {loading ? "Chargement..." : "📡 Actualiser les événements"}
      </Button>

      {error && (
        <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded mb-6">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden border flex flex-col h-[600px] hover:shadow-lg transition-shadow">
              <img 
                src={event.image || PLACEHOLDER_IMAGE} 
                alt="" 
                className="w-full h-48 object-cover bg-gray-100" 
              />
              <div className="p-4 flex flex-col flex-1 min-h-0">
                <h2 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900">{event.title}</h2>
                
                <div className="text-sm text-gray-600 mb-4 overflow-y-auto flex-1 pr-2 whitespace-pre-wrap italic">
                  {event.description || "Aucune description"}
                </div>

                <div className="mt-auto pt-4 border-t space-y-2">
                  <p className="text-sm font-bold text-blue-600">📅 {formatDate(event)}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">📍 {event.location || "Toulouse"}</p>
                  <a href={DISCORD_EVENT_URL} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-[#5865F2] text-white text-center rounded-lg text-sm font-bold hover:bg-[#4752C4] transition-colors">
                    Voir sur Discord
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <img src={event.image || PLACEHOLDER_IMAGE} className="w-20 h-20 rounded object-cover flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 truncate">{event.title}</h2>
                <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                <p className="text-sm font-medium mt-1 text-blue-600">{formatDate(event)}</p>
              </div>
              <a href={DISCORD_EVENT_URL} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200">
                Ouvrir
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
          Aucun événement trouvé sur le serveur Discord.
        </div>
      )}
    </div>
  );
}
