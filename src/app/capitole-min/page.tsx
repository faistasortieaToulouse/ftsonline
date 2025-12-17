"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x200?text=Événement";

// ✅ Images par défaut UT Capitole
const getCapitoleImage = (title?: string) => {
  if (!title) return "/images/capitole/capidefaut.jpg";

  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("cine"))
    return "/images/capitole/capicine.jpg";
  if (lower.includes("conf"))
    return "/images/capitole/capiconf.jpg";
  if (lower.includes("expo"))
    return "/images/capitole/capiexpo.jpg";

  return "/images/capitole/capidefaut.jpg";
};

type UnifiedEvent = {
  id?: string;
  title: string;
  description?: string;
  start?: string;
  date?: string;
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
      const evts: UnifiedEvent[] = Array.isArray(data.events)
        ? data.events
        : [];

      const normalized = evts.map((ev) => {
        const rawDate = ev.date || ev.startDate || ev.start;
        const dateObj = rawDate ? new Date(rawDate) : null;

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

          // ✅ Image UT Capitole intégrée ici
          image:
            ev.image ||
            (ev.source === "Université Toulouse Capitole"
              ? getCapitoleImage(ev.title)
              : PLACEHOLDER_IMAGE),

          link: ev.link || ev.url || "#",
          fullAddress: ev.fullAddress || ev.location || "",
        };
      });

      normalized.sort((a, b) => {
        const da = new Date(a.date || a.startDate || a.start || 0).getTime();
        const db = new Date(b.date || b.startDate || b.start || 0).getTime();
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

  // 🔎 Recherche
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }

    const query = search.toLowerCase();

    setFilteredEvents(
      events.filter((ev) => {
        const text = `${ev.title} ${ev.description || ""} ${
          ev.fullAddress || ""
        } ${ev.source || ""}`.toLowerCase();
        const dateText = ev.dateFormatted?.toLowerCase() || "";
        return text.includes(query) || dateText.includes(query);
      })
    );
  }, [search, events]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Agenda Toulousain</h1>
      <p className="text-muted-foreground mb-6">
        Agenda culturel & institutionnel — {filteredEvents.length} évènement(s)
      </p>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher (titre, lieu, description, date, source...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={fetchAgenda} disabled={loading}>
          {loading ? "Chargement..." : "🔄 Rafraîchir"}
        </Button>

        <Button
          onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}
        >
          🗂️ Cartes
        </Button>

        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}
        >
          📋 Liste
        </Button>
      </div>

      {error && (
        <div className="p-4 mb-4 border border-red-500 bg-red-50 text-red-700 rounded">
          Erreur : {error}
        </div>
      )}

      {/* MODE CARTE */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="bg-white rounded-xl shadow overflow-hidden border"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col">
                <h2 className="text-xl font-semibold text-red-700 mb-2">
                  {ev.title}
                </h2>
                <p className="font-medium text-sm mb-1">
                  📍 {ev.fullAddress}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {ev.dateFormatted}
                </p>
                {ev.description && (
                  <p className="text-sm mb-3 line-clamp-4 whitespace-pre-wrap">
                    {ev.description}
                  </p>
                )}
                <a
                  href={ev.link}
                  target="_blank"
                  className="bg-red-600 text-white py-2 px-3 rounded text-center hover:bg-red-700"
                >
                  🔗 Voir l’événement
                </a>
                {ev.source && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Source : {ev.source}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE LISTE */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="flex items-start gap-4 p-3 border rounded-lg bg-white shadow-sm"
            >
              <img
                src={ev.image}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
                alt={ev.title}
              />
              <div className="flex flex-col flex-1">
                <h2 className="text-lg font-semibold text-red-700 line-clamp-2">
                  {ev.title}
                </h2>
                <p className="text-sm font-medium">
                  📍 {ev.fullAddress}
                </p>
                <p className="text-sm text-gray-600">
                  {ev.dateFormatted}
                </p>
                {ev.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ev.description}
                  </p>
                )}
                <a
                  href={ev.link}
                  target="_blank"
                  className="mt-2 text-red-600 underline"
                >
                  Voir →
                </a>
                {ev.source && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Source : {ev.source}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <p className="mt-6 text-xl text-gray-500 text-center p-8 border border-dashed rounded">
          Aucun événement trouvé.
        </p>
      )}
    </div>
  );
}
