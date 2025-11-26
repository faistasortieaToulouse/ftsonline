"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, MapPin, Clock, ArrowRight, Video } from "lucide-react";

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

const CategoryPill: React.FC<{ category?: Event["category"] }> = ({ category }) => {
if (!category) return null;
let colorClass = "";
switch (category) {
case "Culture": colorClass = "bg-blue-100 text-blue-800"; break;
case "Formation": colorClass = "bg-green-100 text-green-800"; break;
case "Recherche": colorClass = "bg-purple-100 text-purple-800"; break;
case "Vie Étudiante": colorClass = "bg-yellow-100 text-yellow-800"; break;
}
return (
<span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${colorClass}`}>
{category} </span>
);
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => (

  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 border border-gray-100">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
      <CategoryPill category={event.category} />
    </div>

```
{event.image && (
  <img src={event.image} alt={event.title} className="rounded-lg mb-4 w-full object-cover h-48" />
)}

<p className="text-gray-600 mb-4 text-sm">{event.description}</p>

<div className="space-y-2 text-sm text-gray-700">
  <div className="flex items-center space-x-2">
    <Calendar className="w-4 h-4 text-indigo-500" />
    <span>{new Date(event.start).toLocaleDateString("fr-FR", { year:"numeric", month:"short", day:"numeric" })}</span>
  </div>
  {event.end && (
    <div className="flex items-center space-x-2">
      <Clock className="w-4 h-4 text-indigo-500" />
      <span>Fin : {new Date(event.end).toLocaleTimeString("fr-FR")}</span>
    </div>
  )}
  {event.location && (
    <div className="flex items-center space-x-2">
      <MapPin className="w-4 h-4 text-indigo-500" />
      <span>{event.location}</span>
    </div>
  )}
  <div className="flex items-center space-x-2">
    <Video className="w-4 h-4 text-indigo-500" />
    <span>Source : {event.source}</span>
  </div>
</div>

<a href={event.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800 transition duration-150 group">
  Voir l'événement
  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-150 group-hover:translate-x-1" />
</a>
```

  </div>
);

const EventList: React.FC<{ events: Event[] }> = ({ events }) => (

  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {events.map(ev => <EventCard key={ev.id} event={ev} />)}
  </div>
);

export default function Page() {
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [filter, setFilter] = useState<"all" | Event["category"]>("all");

useEffect(() => {
const loadEvents = async () => {
setLoading(true);
try {
const data = await fetchEvents();
setEvents(data);
setError(null);
} catch (err: any) {
setError(err.message);
} finally {
setLoading(false);
}
};
loadEvents();
}, []);

const categories: Event["category"][] = useMemo(() => ["Culture", "Formation", "Recherche", "Vie Étudiante"], []);

const filteredEvents = useMemo(() => {
if (filter === "all") return events;
return events.filter(ev => ev.category === filter);
}, [events, filter]);

return ( <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans"> <div className="max-w-7xl mx-auto">

```
    <header className="py-6 mb-8 text-center bg-white rounded-xl shadow-md">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 tracking-tight">Événements UT2-Min</h1>
      <p className="mt-2 text-lg text-gray-500">Liste des événements et conférences issus de la chaîne UT2-Min (Canal-U).</p>
    </header>

    {/* Boutons de filtrage */}
    <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 mb-8">
      <button
        onClick={() => setFilter("all")}
        className={`px-4 py-2 rounded-full font-medium transition duration-300 ${filter==="all"?"bg-indigo-600 text-white shadow-lg":"bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50"}`}
      >
        Tous ({events.length})
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setFilter(cat)}
          className={`mt-2 sm:mt-0 px-4 py-2 rounded-full font-medium transition duration-300 ${filter===cat?"bg-indigo-600 text-white shadow-lg":"bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50"}`}
        >
          {cat} ({events.filter(e=>e.category===cat).length})
        </button>
      ))}
    </div>

    {loading ? (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-lg text-indigo-600">Chargement des événements...</span>
      </div>
    ) : error ? (
      <div className="text-center p-8 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-md">
        <p className="font-bold">Erreur :</p>
        <p>{error}</p>
      </div>
    ) : filteredEvents.length === 0 ? (
      <div className="text-center p-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded shadow-md">
        <p className="font-bold">Aucun événement trouvé</p>
        <p>La catégorie sélectionnée n’a aucun événement.</p>
      </div>
    ) : (
      <EventList events={filteredEvents} />
    )}

  </div>
</div>
```

);
}
