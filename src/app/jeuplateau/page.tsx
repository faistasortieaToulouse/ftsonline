// src/app/jeuplateau/page.tsx

'use client';

import React, { useState, useEffect } from "react";
// Vous devez avoir ce composant ou utiliser des boutons HTML standards.
// import { Button } from "@/components/ui/button"; 


// --- Fonctions d'aide et Types ---

// 🔴 Suppression de extractFirstImageUrl (plus nécessaire)

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
  creator: string;
  // 🔴 Suppression de content (plus nécessaire)
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

export default function JeuPlateauPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Tous"); 
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  
  // Catégories possibles pour les boutons de filtre
  const categories = ["Tous", "Actualites", "Critiques", "Videos"];

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jeuplateau");
      
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
        creator: it.creator,
        // 🔴 Suppression de content dans le mapping
        category: it.category, 
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

  // Logique de filtrage (par recherche ET par catégorie)
  const filteredEvents = events.filter(ev => {
    const categoryMatch = filterCategory === "Tous" || ev.category === filterCategory;
      
    if (!searchQuery) return categoryMatch;
      
    const q = searchQuery.toLowerCase();
    const searchMatch = (
      ev.title.toLowerCase().includes(q) ||
      (ev.snippet?.toLowerCase().includes(q) ?? false) ||
      (ev.creator?.toLowerCase().includes(q) ?? false)
    );
      
    return categoryMatch && searchMatch;
  });
  
  // Utilitaire de bouton (si vous n'avez pas le composant Shadcn)
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
      <h1 className="text-3xl font-bold mb-4">📰 {events.length > 0 ? events[0].source : 'Actualités Jeux de Plateau'}</h1>
      <p className="text-muted-foreground mb-6">
        Articles fusionnés (Actualités, Critiques, Vidéos) de JeuxOnline.
      </p>

      {/* Boutons de Vue et Actualisation */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
          📺 Vignette (Compacte)
        </Button>
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
          🔲 Liste (Détaillée)
        </Button>
      </div>
      
      {/* Boutons de Catégorie */}
      <div className="flex flex-wrap gap-2 mb-6 items-center border-t pt-4">
        <span className="text-sm font-semibold mr-2">Filtrer par :</span>
        {categories.map(cat => (
            <Button 
                key={cat} 
                onClick={() => setFilterCategory(cat)}
                variant={filterCategory === cat ? "default" : "secondary"}
            >
                {cat}
            </Button>
        ))}
        <input
          type="text"
          placeholder="Rechercher par titre ou mot-clé..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 flex-1 min-w-40 p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Articles affichés : {filteredEvents.length}</p>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun article à afficher.</p>}

      {/* Rendu en mode CARTE (Vignette) */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(ev => {
            return (
              <a key={ev.id} href={ev.url} target="_blank" rel="noopener noreferrer" className="bg-white shadow rounded overflow-hidden flex flex-col h-[280px] hover:shadow-lg transition p-3">
                {/* 🔴 Suppression de l'image */}
                <div className="p-1 flex flex-col flex-1">
                  <span className={`text-xs font-semibold px-2 py-1 rounded w-fit mb-2 ${ev.category === 'Actualites' ? 'bg-green-100 text-green-700' : ev.category === 'Critiques' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{ev.category}</span>
                  <h2 className="text-lg font-semibold mb-1 line-clamp-2">{ev.title}</h2>
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.pubDate)}</p>
                  <p className="text-sm text-gray-700 mb-1 line-clamp-4 flex-1">{ev.snippet}</p>
                  <p className="text-xs text-muted-foreground mt-auto">Auteur : {ev.creator || 'Inconnu'}</p>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        /* Rendu en mode LISTE */
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => {
            return (
              <a key={ev.id} href={ev.url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3 hover:shadow-lg transition">
                {/* 🔴 Suppression de l'image */}
                <div className="flex-1 flex flex-col">
                  <span className={`text-xs font-semibold px-2 py-1 rounded w-fit mb-1 ${ev.category === 'Actualites' ? 'bg-green-100 text-green-700' : ev.category === 'Critiques' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{ev.category}</span>
                  <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.pubDate)}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{ev.snippet}</p>
                  <p className="text-xs text-muted-foreground mt-auto">Auteur : {ev.creator || 'Inconnu'}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
