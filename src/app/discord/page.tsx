// File: src/app/discord/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = "/api/discord";
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement+Discord";
const DISCORD_EVENT_URL = "https://discord.com/channels/1422806103267344416/1423210600036565042";

type DiscordEvent = {
  id: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  cover_image?: string;
};

export default function DiscordEventsPage() {
  const [events, setEvents] = useState<DiscordEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data?.events || []);
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
        event.name?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    })
    .sort(
      (a, b) =>
        new Date(a.scheduled_start_time).getTime() -
        new Date(b.scheduled_start_time).getTime()
    );

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">📆 Événements Discord</h1>
      <p className="text-muted-foreground mb-6">
        Liste des événements Discord du serveur.
      </p>

      <input
        type="text"
        placeholder="Rechercher par nom ou description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />

      <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser les événements"}
      </Button>

      {error && (
        <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[500px]"
            >
              <img
                src={event.cover_image || PLACEHOLDER_IMAGE}
                alt={event.name}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1 min-h-0">
                <h2 className="text-xl font-semibold mb-2 line-clamp-2">{event.name}</h2>
                <div
                  className="text-sm text-muted-foreground mb-2 overflow-y-auto"
                  style={{ flex: 1, minHeight: 0 }}
                >
                  {event.description || "Aucune description"}
                </div>
                <p className="text-sm font-medium mb-1">
                  Début : {new Date(event.scheduled_start_time).toLocaleString()}
                </p>
                {event.scheduled_end_time && (
                  <p className="text-sm text-muted-foreground mb-2">
                    Fin : {new Date(event.scheduled_end_time).toLocaleString()}
                  </p>
                )}

                <Button
                  as="a"
                  href={DISCORD_EVENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2"
                >
                  🔗 Voir sur Discord
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="mt-6 text-muted-foreground">Aucun événement trouvé.</p>
      )}
    </div>
  );
}
