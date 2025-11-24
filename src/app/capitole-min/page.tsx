"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/ut3/ut3expo.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/ut3/ut3cine.jpg";
  if (lower.includes("conf")) return "/images/ut3/ut3conf.jpg";
  if (lower.includes("expo")) return "/images/ut3/ut3expo.jpg";
  return "/images/ut3/ut3expo.jpg";
};

export default function CapitoleMinPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/capitole-min");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setEvents(data);
      setFilteredEvents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFilteredEvents(
      events.filter((ev) =>
        ev.title?.toLowerCase().includes(q) ||
        ev.description?.toLowerCase().includes(q)
      )
    );
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Événements UT Capitole – Ciné / Conf / Expo</h1>
      <p className="text-muted-foreground mb-6">
        Événements filtrés depuis les flux publics de l’Université Toulouse Capitole.
      </p>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement…" : "Actualiser"}
        </Button>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="w-full sm:w-64 p-2 border rounded"
        />
      </div>

      {error && (
        <p className="text-red-600 mb-4 border border-red-300 p-3 bg-red-50 rounded">
          {error}
        </p>
      )}

      <p className="text-sm mb-4">Événements affichés : {filteredEvents.length}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => (
          <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col">
            <img
              src={getEventImage(ev.title)}
              alt={ev.title}
              className="w-full h-40 object-cover"
            />

            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>

              {ev.start && (
                <p className="text-sm text-blue-600 font-medium mb-2">
                  {new Date(ev.start).toLocaleString()}
                </p>
              )}

              {ev.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-4">
                  {ev.description}
                </p>
              )}

              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm mb-2"
                >
                  🔗 Plus d’informations
                </a>
              )}

              <p className="text-xs text-muted-foreground mt-auto pt-2 border-t">
                Source : UT Capitole
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
