"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE = "/images/capitole/capidefaut.jpg";

// Images par défaut selon le type d'événement
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

type EventType = {
  id: string;
  title: string;
  description?: string;
  start?: string;
  url?: string;
  image?: string;
  source?: string;
};

export default function CapitoleMinPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const rssUrl = "https://www.ut-capitole.fr/adminsite/webservices/export_rss.jsp?NOMBRE=50&CODE_RUBRIQUE=1315555643369&LANGUE=0";
      const res = await fetch(rssUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`Flux UT Capitole inaccessible (${res.status})`);
      const xmlText = await res.text();

      // Parse XML côté client
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const items = Array.from(xml.querySelectorAll("item"));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const parsedEvents: EventType[] = items.map((item) => {
        const title = item.querySelector("title")?.textContent?.trim() || "Événement UT Capitole";
        const link = item.querySelector("link")?.textContent?.trim() || "#";
        const pubDate = item.querySelector("pubDate")?.textContent;
        let start = pubDate ? new Date(pubDate) : today;
        if (!start || isNaN(start.getTime()) || start < today) start = today;

        const description = item.querySelector("description")?.textContent?.trim() || "Événement ouvert à tous";

        return {
          id: link,
          title,
          description,
          start: start.toISOString(),
          url: link,
          image: getCapitoleImage(title),
          source: "Université Toulouse Capitole",
        };
      });

      setEvents(parsedEvents);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de récupérer les événements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) =>
    `${ev.title} ${ev.description} ${ev.source}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Événements UT Capitole – Ciné, Conf & Expo</h1>
      <p className="text-muted-foreground mb-6">Événements filtrés depuis le flux officiel de l’Université Toulouse Capitole.</p>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "🔄 Actualiser"}
        </Button>

        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
          🗂️ Cartes
        </Button>

        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
          📋 Liste
        </Button>

        <input
          type="text"
          placeholder="Rechercher par titre ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 sm:mt-0 w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Événements affichés : {filteredEvents.length}</p>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun événement trouvé.</p>}

      {/* Mode card */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[480px]">
              <img src={ev.image} alt={ev.title} className="w-full h-40 object-cover" />
              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-1">{new Date(ev.start!).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>}
                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-1">🔗 Plus d’informations</a>
                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode list */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3">
              <img src={ev.image} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-1">{new Date(ev.start!).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                {ev.description && <p className="text-sm text-muted-foreground mb-1 line-clamp-4">{ev.description}</p>}
                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-1">🔗 Plus d’informations</a>
                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
