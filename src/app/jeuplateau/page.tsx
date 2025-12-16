'use client';

import React, { useState, useEffect } from "react";
// Assurez-vous d'avoir ce composant Button ou remplacez par un <button> HTML standard
// si vous n'utilisez pas shadcn/ui.
// import { Button } from "@/components/ui/button"; 

// --- Fonctions d'aide ---

// 1. Extraction d'image à partir du contenu HTML
const extractFirstImageUrl = (htmlContent: string | undefined): string | undefined => {
  if (!htmlContent) return undefined;
  // Regex pour trouver la première balise <img> et capturer l'URL dans 'src'
  const match = htmlContent.match(/<img[^>]+src="([^"]+)"/);
  // Retourne l'URL trouvée, ou un placeholder si aucune image n'est trouvée
  return match ? match[1] : undefined;
};

// 2. Formatage de la date (pubDate est déjà une string)
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
    return isoDate; // Retourne la chaîne brute si le formatage échoue
  }
};

// 3. Types pour les données récupérées (Mise à jour pour inclure 'content')
interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  creator: string;
  content: string; // ⚠️ Doit être disponible via /api/jeuplateau
}

interface ApiResponse {
  title: string;
  description: string;
  items: RssItem[];
  source: string;
  error?: string;
  details?: string;
}

// 4. Adaptation du type d'événement pour le composant
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
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

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
        content: it.content,
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

  // Logique de filtrage par titre, snippet et créateur
  const filteredEvents = events.filter(ev => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      (ev.snippet?.toLowerCase().includes(q) ?? false) ||
      (ev.creator?.toLowerCase().includes(q) ?? false)
    );
  });
  
  // Utilitaire pour le bouton (Remplacez Button par <button> si non disponible)
  const Button = ({ children, onClick, disabled, variant = "default" }: any) => (
      <button 
          onClick={onClick} 
          disabled={disabled}
          className={`px-4 py-2 rounded text-white transition duration-150 ${
            variant === 'default' ? 'bg-indigo-600 hover:bg-indigo-700' : 
            (variant === 'secondary' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-700')
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
          {children}
      </button>
  );


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">📰 Actualités Jeux de Plateau (JeuxOnline)</h1>
      <p className="text-muted-foreground mb-6">
        Articles filtrés depuis le flux RSS de JeuxOnline.
      </p>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchEvents} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>
        <Button onClick={() => setViewMode("card")} variant={viewMode === "card" ? "default" : "secondary"}>
          📺 Vignette
        </Button>
        <Button onClick={() => setViewMode("list")} variant={viewMode === "list" ? "default" : "secondary"}>
          🔲 Liste
        </Button>
        <input
          type="text"
          placeholder="Rechercher par titre, extrait ou auteur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 flex-1 min-w-40 p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Articles affichés : {filteredEvents.length}</p>
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">{error}</div>}
      {filteredEvents.length === 0 && !loading && <p className="text-muted-foreground">Aucun article à afficher.</p>}

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map(ev => {
            const imageUrl = extractFirstImageUrl(ev.content);
            return (
              <a key={ev.id} href={ev.url} target="_blank" rel="noopener noreferrer" className="bg-white shadow rounded overflow-hidden flex flex-col h-[400px] hover:shadow-lg transition">
                <img 
                  src={imageUrl || "https://via.placeholder.com/400x200?text=JeuxOnline"} 
                  alt={ev.title} 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-3 flex flex-col flex-1">
                  <h2 className="text-lg font-semibold mb-1 line-clamp-2">{ev.title}</h2>
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.pubDate)}</p>
                  <p className="text-sm text-gray-700 mb-1 line-clamp-4 flex-1">{ev.snippet}</p>
                  <p className="text-xs text-muted-foreground mt-auto">Auteur : {ev.creator || 'Inconnu'}</p>
                  <p className="text-xs text-muted-foreground">Source : {ev.source}</p>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map(ev => {
            const imageUrl = extractFirstImageUrl(ev.content);
            return (
              <a key={ev.id} href={ev.url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3 hover:shadow-lg transition">
                <img 
                  src={imageUrl || "https://via.placeholder.com/150x100?text=JO"} 
                  alt={ev.title} 
                  className="w-full sm:w-40 h-24 object-cover rounded flex-shrink-0" 
                />
                <div className="flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-1">{ev.title}</h2>
                  <p className="text-sm text-blue-600 font-medium mb-1">{formatDate(ev.pubDate)}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{ev.snippet}</p>
                  <p className="text-xs text-muted-foreground mt-auto">Auteur : {ev.creator || 'Inconnu'} | Source : {ev.source}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
