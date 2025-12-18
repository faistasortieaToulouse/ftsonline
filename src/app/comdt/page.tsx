'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import parse from "html-react-parser";

export const dynamic = "force-dynamic"; // ⚡ Evite le SSG et l'erreur Dynamic server usage

const MAX_EVENTS = 50;

// 🔹 Images par défaut selon catégorie
const DEFAULT_IMAGES: Record<string, string> = {
  "Stages": "/images/comdt/catecomdtstage.jpg",
  "Stages de danse": "/images/comdt/catecomdtdanse.jpg",
  "Stages de musique": "/images/comdt/catecomdtmusique.jpg",
  "Saison du COMDT": "/images/comdt/catecomdtcomdt.jpg",
  "Evénements partenaires": "/images/comdt/catecomdtpartenaire.jpg",
};

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Événement";

// 🔹 Formater les descriptions avec sauts de ligne
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

  // 🔹 Récupération des événements ICS depuis l'API
  async function fetchEvents() {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const res = await fetch("/api/comdt");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data.events)) throw new Error("Données invalides");

      const mappedEvents = data.events.map((ev: any) => {
        const dateFormatted = ev.date
          ? new Date(ev.date).toLocaleString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date non spécifiée";

        const image =
          ev.image || DEFAULT_IMAGES[ev.category] || PLACEHOLDER_IMAGE;

        return {
          id: ev.id || Math.random().toString(),
          title: ev.title || "Événement COMDT",
          description: ev.description || "",
          url: ev.link || "#",
          image,
          category: ev.category || "COMDT",
          date: ev.date,
          dateFormatted,
          fullAddress: ev.location || "Lieu non spécifié",
        };
      });

      // 🔹 Tri par date et limitation
      const uniqueEvents = Array.from(
        new Map(mappedEvents.map((e) => [e.id, e])).values()
      )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
      <h1 className="text-3xl font-bold mb-4">
        🎶 Agenda du COMDT (Centre des Musiques et Danses Traditionnelles)
      </h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Rechercher un événement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded"
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
            🔲 Liste
          </Button>
        </div>
      </div>

      <Button onClick={fetchEvents} disabled={loading} className="mb-6">
        {loading ? "Chargement..." : "📡 Actualiser"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border rounded mb-6">
          {error}
        </div>
      )}

      {filteredEvents.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun événement à venir.</p>
      )}

      {/* 🔴 MODE CARTES */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev, i) => (
            <div
              key={ev.id || i}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[560px]"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-full aspect-[16/9] object-cover"
              />
              <div className="p-4 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-1">{ev.title}</h2>
                <p className="text-sm text-blue-600 font-medium mb-2">
                  {ev.category}
                </p>
                <p className="text-sm font-medium mb-2">{ev.dateFormatted}</p>

                {ev.description && (
                  <div className="text-sm text-muted-foreground mb-3 flex-1">
                    <div className="h-32 overflow-y-auto pr-2 scrollable">
                      {formatDescription(ev.description)}
                    </div>
                  </div>
                )}

                {ev.url && (
                  <Button
                    asChild
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <a href={ev.url} target="_blank" rel="noopener noreferrer">
                      🔗 Voir l’événement
                    </a>
                  </Button>
                )}
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
              className="flex gap-4 p-4 border rounded bg-white"
            >
              <img
                src={ev.image}
                alt={ev.title}
                className="w-24 h-24 rounded object-cover"
              />
              <div className="flex flex-col flex-1">
                <h2 className="text-lg font-semibold">{ev.title}</h2>
                <p className="text-sm text-blue-600">{ev.category}</p>
                <p className="text-sm">{ev.dateFormatted}</p>
                {ev.description && (
                  <div className="text-sm text-muted-foreground line-clamp-3 mt-1">
                    {formatDescription(ev.description)}
                  </div>
                )}
                {ev.url && (
                  <Button
                    asChild
                    size="sm"
                    className="mt-2 w-fit bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <a href={ev.url} target="_blank" rel="noopener noreferrer">
                      Voir l’événement →
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
