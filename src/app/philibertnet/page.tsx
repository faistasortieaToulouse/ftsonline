'use client';

import React, { useState, useEffect } from "react";

// --- Fonctions d'aide et Types ---

const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return "Date non spécifiée";
  try {
    const date = new Date(isoDate);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
};

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  category: string; 
}

interface ApiResponse {
  title: string;
  description: string;
  items: RssItem[];
  source: string;
  error?: string;
  details?: string;
}

interface EventItem extends RssItem {
    id: number;
    url: string;
}

// --- Composant Principal ---

export default function PhilibertnetPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card"); // 🔹 ajout du mode de vue

  const categories = ["Actualites"];

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/philibertnet");
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`${errData.error || 'Erreur API'}: ${errData.details || 'Aucun détail'}`);
      }
      
      const data: ApiResponse = await res.json();
      const formatted = data.items.map((it, idx) => ({
        id: idx,
        title: it.title,
        link: it.link,
        pubDate: it.pubDate,
        snippet: it.snippet,
        category: 'Actualites', // Forcer Actualités
        url: it.link,
        source: data.source,
      }));
      setEvents(formatted);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEvents(); }, []);

  // Filtrage par recherche uniquement (catégorie fixe)
  const filteredEvents = events.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ev.title.toLowerCase().includes(q) || (ev.snippet?.toLowerCase().includes(q) ?? false);
  });

  // Utilitaire de bouton
  const Button = ({ children, onClick, disabled, variant = "default" }: any) => (
      <button 
          onClick={onClick} 
          disabled={disabled}
          className={`px-4 py-2 rounded text-white transition duration-150 text-sm ${
            variant === 'default' ? 'bg-indigo-600 hover:bg-indigo-700' : 
            (variant === 'secondary' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700')
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
          {children}
      </button>
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">📰 {events.length > 0 ? events[0].source : 'Actualités Philibert'}</h1>
      <p className="text-muted-foreground mb-6">
        Articles récents de Philibert (Actualités uniquement).
      </p>

      {/* Boutons Actualiser + Vignette / Liste */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
        📺 Vignette
        </Button>

        </
