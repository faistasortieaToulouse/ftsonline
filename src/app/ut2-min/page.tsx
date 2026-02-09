'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Video, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Event {
id: string;
title: string;
description: string;
start: string;
end: string | null;
location: string | null;
image: string | null;
url: string;
source: string;
category?: "Culture" | "Formation" | "Recherche" | "Vie Étudiante";
}

const fetchEvents = async (): Promise<Event[]> => {
const res = await fetch("/api/ut2-min");
if (!res.ok) throw new Error("Impossible de récupérer les événements UT2-Min.");
return res.json();
};

export default function UT2MinPage() {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [events, setEvents] = useState<Event[]>([]);
const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
const [viewMode, setViewMode] = useState<"card" | "list">("card");
const [searchQuery, setSearchQuery] = useState("");

async function loadEvents() {
setLoading(true);
setError(null);
setEvents([]);
setFilteredEvents([]);
try {
const data = await fetchEvents();
const cleaned = data.map((ev, index) => ({
...ev,
id: `${ev.id}-${index}`,
dateFormatted: new Date(ev.start).toLocaleString("fr-FR", {
weekday: "long",
year: "numeric",
month: "long",
day: "numeric",
}),
fullAddress: ev.location || "",
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
loadEvents();
}, []);

useEffect(() => {
if (!searchQuery) {
setFilteredEvents(events);
return;
}
const q = searchQuery.toLowerCase();
setFilteredEvents(
events.filter(ev =>
(ev.title?.toLowerCase().includes(q) ?? false) ||
(ev.description?.toLowerCase().includes(q) ?? false) ||
(ev.fullAddress?.toLowerCase().includes(q) ?? false) ||
(ev.dateFormatted?.toLowerCase().includes(q) ?? false) ||
(ev.category?.toLowerCase().includes(q) ?? false)
)
);
}, [searchQuery, events]);

return ( <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

<h1 className="text-3xl font-bold mb-4">Événements UT2-Min</h1> <p className="text-muted-foreground mb-6">
Liste des événements et conférences issus de la chaîne UT2-Min (Canal-U). </p>


  <input
    type="text"
    placeholder="Rechercher par titre, description, lieu, date, catégorie..."
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
  />

  <p className="mb-4 font-semibold">Événements affichés : {filteredEvents.length}</p>

  <div className="flex flex-wrap gap-4 mb-6">
    <Button onClick={loadEvents} disabled={loading}>
      {loading ? "Chargement..." : "📡 Actualiser"}
    </Button>
    <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
      📺 Plein écran
    </Button>
    <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
      🔲 Vignette
    </Button>
  </div>
      
      {/* --- ETAT DE CHARGEMENT --- */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100">
          <Loader2 className="animate-spin h-12 w-12 text-blue-700 mb-4" />
          <p className="text-blue-700 font-bold text-xl italic animate-pulse">
            🚀 En cours de chargement...
          </p>
        </div>
      )}

  {error && (
    <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>
  )}

  {filteredEvents.length === 0 && !loading && (
    <p className="text-muted-foreground">Aucun événement à afficher.</p>
  )}

  {/* MODE CARD */}
  {viewMode === "card" && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map(ev => (
        <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-full">
          {ev.image && <img src={ev.image} alt={ev.title} className="w-full aspect-[16/9] object-cover" />}
          <div className="p-4 flex flex-col flex-1 gap-1">
            <h2 className="text-xl font-semibold">{ev.title}</h2>
            {ev.category && <p className="text-sm text-blue-600 font-medium mt-1">{ev.category}</p>}
            {ev.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-4">{ev.description}</p>}
            <p className="text-sm mt-2">{ev.dateFormatted}</p>
            {ev.fullAddress && <p className="text-sm text-muted-foreground">{ev.fullAddress}</p>}
            <p className="text-xs text-muted-foreground italic mt-1">Source : {ev.source}</p>
            {ev.url && (
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block bg-blue-600 text-white text-center py-2 px-3 rounded hover:bg-blue-700 transition"
              >
                🔗 Voir l’événement officiel
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )}

  {/* MODE LIST */}
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
            <p className="text-xs text-muted-foreground mt-1 italic">Source : {ev.source}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


);
}
