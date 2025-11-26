'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getEventImage } from "@/utils/eventImages";

const MAX_EVENTS = 100;

export default function InpEventsPage() {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [events, setEvents] = useState<any[]>([]);
const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

const [viewMode, setViewMode] = useState<"card" | "list">("card");
const [searchQuery, setSearchQuery] = useState("");

async function fetchUpcomingEvents() {
setLoading(true);
setError(null);
setEvents([]);
setFilteredEvents([]);

try {
  const res = await fetch("/api/inp-min");
  if (!res.ok) throw new Error(`API HTTP error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data || !Array.isArray(data)) return setEvents([]);

  const unique = new Map<string, any>();
  data.forEach(ev => {
    const key = `${ev.title}-${ev.start}-${ev.location}`;
    if (!unique.has(key)) unique.set(key, ev);
  });

  const cleaned = Array.from(unique.values())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, MAX_EVENTS)
    .map((ev, index) => ({
      ...ev,
      id: `${ev.id}-${index}`,
      image: getEventImage(ev),
      fullAddress: ev.location,
      dateFormatted: ev.start ? new Date(ev.start).toLocaleString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) : "",
    }));

  setEvents(cleaned);
  setFilteredEvents(cleaned);

} catch (err: any) {
  setError(err.message);
} finally {
  setLoading(false);
}
}

useEffect(() => {
fetchUpcomingEvents();
}, []);

useEffect(() => {
if (!searchQuery) {
setFilteredEvents(events);
return;
}
const q = searchQuery.toLowerCase();
setFilteredEvents(events.filter(ev =>
(ev.title?.toLowerCase().includes(q) ?? false) ||
(ev.description?.toLowerCase().includes(q) ?? false) ||
(ev.fullAddress?.toLowerCase().includes(q) ?? false) ||
(ev.dateFormatted?.toLowerCase().includes(q) ?? false)
));
}, [searchQuery, events]);

return ( <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"> <h1 className="text-3xl font-bold mb-4">Événements INP Toulouse</h1> <p className="text-muted-foreground mb-6">
Cette page affiche les 100 prochains événements culturels de l’INP. </p>

  <input
    type="text"
    placeholder="Rechercher par titre, description, lieu, date..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
  />

  <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

  <div className="flex flex-wrap gap-4 mb-6">
    <Button onClick={fetchUpcomingEvents} disabled={loading}>
      {loading ? "Chargement..." : "📡 Actualiser"}
    </Button>

    <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>📺 Plein écran</Button>
    <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>🔲 Vignette</Button>
  </div>

  {error && (
    <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
      {error}
    </div>
  )}

  {filteredEvents.length === 0 && !loading && (
    <p className="text-muted-foreground">Aucun événement à afficher.</p>
  )}

  {viewMode === "card" && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map(ev => (
        <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-full">
          {ev.image && <img src={ev.image} alt={ev.title} className="w-full aspect-[16/9] object-cover" />}
          <div className="p-4 flex flex-col flex-1 gap-1">
            <h2 className="text-xl font-semibold">{ev.title}</h2>
            {ev.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-4">{ev.description}</p>}
            {ev.dateFormatted && <p className="text-sm mt-2">{ev.dateFormatted}</p>}
            {ev.fullAddress && <p className="text-sm text-muted-foreground">{ev.fullAddress}</p>}
            <p className="text-xs text-muted-foreground italic mt-1">Source : INP Toulouse</p>
            {ev.url && (
              <a href={ev.url} target="_blank" rel="noopener noreferrer"
                 className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition">
                🔗 Voir l’événement officiel
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )}

  {viewMode === "list" && (
    <div className="space-y-4">
      {filteredEvents.map(ev => (
        <div key={ev.id} className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm">
          {ev.image && <img src={ev.image} alt={ev.title} className="w-24 h-24 rounded object-cover flex-shrink-0" />}
          <div className="flex flex-col flex-1 gap-1">
            <h2 className="text-lg font-semibold line-clamp-2">{ev.title}</h2>
            {ev.dateFormatted && <p className="text-sm text-blue-600">{ev.dateFormatted}</p>}
            {ev.fullAddress && <p className="text-sm text-muted-foreground">{ev.fullAddress}</p>}
            {ev.description && <p className="text-sm text-muted-foreground line-clamp-3">{ev.description}</p>}
            {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline mt-1">Voir l’événement</a>}
            <p className="text-xs text-muted-foreground mt-1 italic">Source : INP Toulouse</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

);
}
