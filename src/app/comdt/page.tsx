'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";

export const dynamic = "force-dynamic";

const MAX_EVENTS = 50;

const DEFAULT_IMAGES: Record<string, string> = {
  "Stages": "/images/comdt/catecomdtstage.jpg",
  "Stages de danse": "/images/comdt/catecomdtdanse.jpg",
  "Stages de musique": "/images/comdt/catecomdtmusique.jpg",
  "Saison du COMDT": "/images/comdt/catecomdtcomdt.jpg",
  "Evénements partenaires": "/images/comdt/catecomdtpartenaire.jpg",
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

function formatDescription(desc: string) {
  if (!desc) return "";
  const html = desc.replace(/\n/g, "<br />");
  return parse(html);
}

export default function ComdtPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/comdt");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data.events)) throw new Error("Données invalides");

      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 31);

      const mappedEvents = data.events.map((ev: any) => {
        const dateObj = ev.date ? new Date(ev.date) : null;
        const dateFormatted = dateObj
          ? dateObj.toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date non spécifiée";

        const image = ev.image || DEFAULT_IMAGES[ev.category] || PLACEHOLDER_IMAGE;

        return {
          id: ev.id || Math.random().toString(),
          title: ev.title || "Événement COMDT",
          description: ev.description || "",
          url: ev.link || "#",
          image,
          category: ev.category || "COMDT",
          date: dateObj,
          dateFormatted,
          fullAddress: ev.location || "Lieu non spécifié",
          source: "COMDT"
        };
      });

      const filteredByDate = mappedEvents.filter(
        (ev) => ev.date && ev.date >= today && ev.date <= maxDate
      );

      const uniqueEvents = Array.from(
        new Map(filteredByDate.map((e) => [e.id, e])).values()
      )
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, MAX_EVENTS);

      setEvents(uniqueEvents);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const search = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(search) ||
      ev.description.toLowerCase().includes(search) ||
      ev.category.toLowerCase().includes(search) ||
      ev.dateFormatted.toLowerCase().includes(search) ||
      ev.fullAddress.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Style scrollbar personnalisé */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <h1 className="text-3xl font-bold mb-2 text-indigo-900">
        🎶 Agenda du COMDT
      </h1>

      <p className="text-sm text-gray-600 mb-6">
        {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} à venir (31 prochains jours)
      </p>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher un événement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("card")}
            variant={viewMode === "card" ? "default" : "secondary"}
          >
            📺 Cartes
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "default" : "secondary"}
          >
            📋 Liste
          </Button>
        </div>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-8">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 🔴 MODE CARTES */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[520px] border border-gray-100"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                   📍 {ev.fullAddress}
                </p>
                <h2 className="text-lg font-semibold mb-1 leading-tight line-clamp-2">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-semibold mb-1">
                  {ev.category}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-3">{ev.dateFormatted}</p>

                {ev.description && (
                  <div className="text-sm text-muted-foreground mb-4 flex-1 overflow-hidden">
                    <div className="h-24 overflow-y-auto pr-2 custom-scrollbar text-justify leading-relaxed">
                      {formatDescription(ev.description)}
                    </div>
                  </div>
                )}

                <div className="mt-auto space-y-3">
                  {ev.url && (
                    <Button
                      asChild
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 transition-all"
                    >
                      <a href={ev.url} target="_blank" rel="noopener noreferrer">
                        🔗 VOIR L'ÉVÉNEMENT
                      </a>
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Source : {ev.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🟨 MODE LISTE */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="flex flex-col sm:flex-row gap-6 p-4 border rounded-xl bg-white shadow-sm items-center"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-full sm:w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex flex-col flex-1">
                <h2 className="text-lg font-bold text-gray-800 leading-tight">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-semibold">{ev.category}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">📍 {ev.fullAddress}</p>
                <p className="text-sm font-medium mt-1">{ev.dateFormatted}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {ev.url && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 h-9"
                    >
                      <a href={ev.url} target="_blank" rel="noopener noreferrer">
                        Voir l’événement →
                      </a>
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Source : {ev.source}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}