// en-tête inchangé
'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// getEventImage (inchangé)
const getEventImage = (title: string | undefined) => {
  if (!title) return "/images/capitole/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine")) return "/images/capitole/capicine.jpg";
  if (lower.includes("conf")) return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo")) return "/images/capitole/capiexpo.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// --- NOUVEAU : helper de formatage des dates ---
const formatDate = (iso?: string | null) => {
  if (!iso) return "";

  // try parse
  try {
    // Some feeds give plain "YYYY-MM-DD" or "YYYY-MM-DDT00:00:00Z".
    // Normalize: if it looks like a plain date without time, add "T00:00:00Z"
    let normalized = iso;
    // If iso is like "2025-11-14" -> turn into "2025-11-14T00:00:00Z"
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) normalized = iso + "T00:00:00Z";

    const d = new Date(normalized);
    if (isNaN(d.getTime())) return iso;

    // If the source provided time as exactly midnight UTC (i.e. no real time),
    // we display only the date (no time) to avoid showing 00:00:00.
    const isMidnightUTC = /T00:00:00(?:\.000)?Z?$/.test(normalized);

    const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeZone: "Europe/Paris",
    });

    if (isMidnightUTC) {
      return dateFormatter.format(d); // e.g. "14 novembre 2025"
    }

    const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });

    return dateTimeFormatter.format(d); // e.g. "14 novembre 2025 à 20:30"
  } catch (e) {
    return iso;
  }
};

export default function CapitoleMinPage() {
  // ... tout ton état et fetchEvents identiques ...

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/capitole-min");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredEvents(
      events.filter(ev =>
        ev.title.toLowerCase().includes(q) ||
        (ev.description?.toLowerCase().includes(q) ?? false) ||
        (ev.location?.toLowerCase().includes(q) ?? false) ||
        (ev.start?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [searchQuery, events]);

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* en-tête & recherche inchangés */}
      <h1 className="text-3xl font-bold mb-4">Événements UT Capitole – Ciné, Conf & Expo</h1>
      <p className="text-muted-foreground mb-6">
        Événements filtrés depuis le flux officiel de l’Université Toulouse Capitole.
      </p>

      {/* ... boutons et éléments de recherche ... */}

      {/* Extrait du rendu où on affichait la date */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white shadow rounded overflow-hidden flex flex-col h-[480px]">
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full h-56 object-cover" />
              <div className="p-4 flex flex-col flex-1 overflow-hidden">
                <h2 className="text-lg font-semibold mb-1 line-clamp-2">{ev.title}</h2>

                {/* <-- ici on utilise formatDate */}
                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    {formatDate(ev.start)}
                    {ev.end ? ` → ${formatDate(ev.end)}` : ""}
                  </p>
                )}

                {ev.location && <p className="text-sm text-muted-foreground mb-1">📍 {ev.location}</p>}

                {ev.description && (
                  <div className="text-sm text-muted-foreground overflow-y-auto max-h-20 mb-2 pr-1">
                    {ev.description}
                  </div>
                )}

                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mb-1">
                    🔗 Plus d’informations
                  </a>
                )}

                <p className="text-xs text-muted-foreground mt-auto">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* mode list (même principe) */
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row bg-white shadow rounded p-4 gap-4 h-40">
              <img src={getEventImage(ev.title)} alt={ev.title} className="w-full sm:w-40 h-36 object-cover rounded" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1 line-clamp-2">{ev.title}</h2>

                {ev.start && (
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    {formatDate(ev.start)}
                    {ev.end ? ` → ${formatDate(ev.end)}` : ""}
                  </p>
                )}

                {/* reste inchangé */}
                {ev.location && <p className="text-sm mb-1 text-muted-foreground">📍 {ev.location}</p>}
                {ev.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{ev.description}</p>}
                {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">🔗 Plus d’informations</a>}
                <p className="text-xs text-muted-foreground mt-1">Source : {ev.source}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
