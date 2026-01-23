'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Image par défaut locale
const DEFAULT_IMAGE = "/images/ecluse/cateporteecluse.jpg";

const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Fonction pour Source : Majuscule puis minuscules
const formatSource = (text: string) => {
  if (!text) return "";
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function EclusePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = DEFAULT_IMAGE;
  };

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ecluse");
      if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
      const data = await res.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 31);

      const formatted = (data.events ?? []).map((it: any, idx: number) => ({
        id: idx,
        title: it.title,
        description: it.description || "",
        start: it.date || it.pubDate,
        url: it.link,
        source: it.source || "L'Écluse",
        location: it.location || "",
        image: it.image || null,
      }))
      .filter((ev: any) => {
        if (!ev.start) return false;
        const d = new Date(ev.start);
        if (isNaN(d.getTime())) return false;
        if (d < today || d > maxDate) return false;
        return ev.location?.includes("31") || ev.location?.toUpperCase().includes("TOULOUSE");
      })
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());

      setEvents(formatted);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  const filteredEvents = events.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-2 text-indigo-900">Événements L'Écluse</h1>
      
      <p className="text-sm text-gray-600 mb-6">
        {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} à venir (31 prochains jours)
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Rechercher par titre, description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
        />
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
            📺 Cartes
          </Button>
          <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
            📋 Liste
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="font-semibold text-sm text-gray-600">Résultats : {filteredEvents.length}</p>
        <Button onClick={fetchEvents} disabled={loading} size="sm">
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border rounded-lg mb-6 text-sm italic">{error}</div>}

      <div className={viewMode === "card" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
        {filteredEvents.map(ev => (
          <div key={ev.id} className={`bg-white shadow rounded-xl overflow-hidden flex flex-col border border-gray-100 ${viewMode === "card" ? "h-[540px]" : "sm:flex-row h-auto p-4 gap-6 shadow-sm"}`}>
            
            <img 
              src={ev.image || DEFAULT_IMAGE} 
              alt={ev.title} 
              onError={handleImageError}
              className={`${viewMode === "card" ? "w-full h-44" : "w-full sm:w-40 h-40 rounded-lg"} object-cover shrink-0`}
            />

            <div className="p-4 flex flex-col flex-1">
              <div className="mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   📍 {ev.location || "Lieu non précisé"}
                </p>
              </div>

              {ev.start && (
                <p className="text-sm text-blue-600 font-bold mb-1">
                  {formatDate(ev.start)}
                </p>
              )}

              <h2 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800 leading-tight">
                {ev.title}
              </h2>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4 flex-1 text-justify">
                {ev.description}
              </p>
              
              <div className="mt-auto space-y-3">
                {ev.url && (
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm transition-all"
                  >
                    <a href={ev.url} target="_blank" rel="noopener noreferrer">
                      🔗 VOIR L’ÉVÉNEMENT
                    </a>
                  </Button>
                )}
                
                {/* Source à gauche, formatée : Majuscule puis minuscules */}
                <div className="text-left">
                  <span className="text-xs text-muted-foreground">
                    Source : {formatSource(ev.source)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
