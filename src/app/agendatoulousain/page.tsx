"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

type UnifiedEvent = {
  id?: string;
  title: string;
  description?: string;
  start?: string;       // Utilisé par Radar Squat
  date?: string;        // Utilisé par l'agrégateur
  startDate?: string;
  url?: string;
  link?: string;
  fullAddress?: string;
  location?: string;
  image?: string;
  category?: string;
  source?: string;
  dateFormatted?: string;
};

export default function AgendaToulousainPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UnifiedEvent[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchAgenda() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agendatoulousain");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const data = await res.json();
      const evts: UnifiedEvent[] = Array.isArray(data.events) ? data.events : [];

      const normalized = evts.map((ev) => {
        // Priorité aux clés de date pour la robustesse
        const rawDate = ev.date || ev.start || ev.startDate;
        const dateObj = rawDate ? new Date(rawDate) : null;

        // Gestion de l'image (Radar Squat envoie une image locale /logo/...)
        let image = ev.image || PLACEHOLDER_IMAGE;
        if (!ev.image && ev.source?.toLowerCase().includes("capitole")) {
          image = getCapitoleImage(ev.title);
        }

        return {
          ...ev,
          dateFormatted:
            dateObj && !isNaN(dateObj.getTime())
              ? dateObj.toLocaleString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Date inconnue",
          image,
          // Correction pour Radar Squat qui utilise 'link' ou 'url'
          link: ev.link || ev.url || "#",
          fullAddress: ev.fullAddress || ev.location || "Lieu non précisé",
        };
      });

      // Tri chronologique
      normalized.sort((a, b) => {
        const da = new Date(a.date || a.start || 0).getTime();
        const db = new Date(b.date || b.start || 0).getTime();
        return da - db;
      });

      setEvents(normalized);
      setFilteredEvents(normalized);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgenda();
  }, []);

  useEffect(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      setFilteredEvents(events);
      return;
    }

    setFilteredEvents(
      events.filter((ev) => {
        const text = `${ev.title} ${ev.description || ""} ${ev.fullAddress || ""} ${ev.source || ""}`.toLowerCase();
        return text.includes(query);
      })
    );
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda Toulousain</h1>
          <p className="text-muted-foreground">
            Multi-sources — {filteredEvents.length} évènement(s)
          </p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "outline"} size="sm">🗂️</Button>
           <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "outline"} size="sm">📋</Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Rechercher un concert, un lieu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
        />
        <Button onClick={fetchAgenda} disabled={loading} variant="secondary">
          {loading ? "..." : "🔄"}
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-6 border border-red-500 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev, i) => (
            <div key={ev.id || i} className="bg-white rounded-xl shadow-sm overflow-hidden border flex flex-col h-full hover:shadow-md transition-shadow">
              <img src={ev.image} alt="" className="w-full aspect-video object-cover bg-gray-100" />
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-600">{ev.source}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{ev.title}</h2>
                <p className="text-sm text-red-600 font-medium mb-1">📅 {ev.dateFormatted}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">📍 {ev.fullAddress}</p>
                {ev.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 italic">
                    {ev.description.substring(0, 150)}...
                  </p>
                )}
                <div className="mt-auto">
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 bg-zinc-900 text-white text-center rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Voir les détails
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Liste compacte */
        <div className="space-y-3">
          {filteredEvents.map((ev, i) => (
            <a key={ev.id || i} href={ev.link} target="_blank" className="flex items-center gap-4 p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
               <img src={ev.image} className="w-16 h-16 rounded object-cover" alt="" />
               <div className="flex-1">
                 <h3 className="font-bold text-gray-900 line-clamp-1">{ev.title}</h3>
                 <p className="text-xs text-gray-500">{ev.dateFormatted} • {ev.fullAddress}</p>
               </div>
               <span className="text-[10px] text-gray-400 font-mono">{ev.source}</span>
            </a>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          Aucun événement ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
