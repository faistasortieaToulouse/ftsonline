"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Image fallback selon titre
const getMovieImage = (title: string | undefined, poster: string | null) => {
  if (poster) return `https://image.tmdb.org/t/p/w500${poster}`;

  if (!title) return "/images/capidefaut.jpg";
  const lower = title.toLowerCase();
  if (lower.includes("ciné") || lower.includes("film")) return "/images/capitole/capicine.jpg";
  return "/images/capitole/capidefaut.jpg";
};

// Format date FR
const formatDate = (iso: string | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function CinemaToulousePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  async function fetchMovies() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cinematoulouse");
      if (!res.ok) throw new Error(`Erreur API ${res.status}`);
      const data = await res.json();

      const sorted = [...data.results].sort(
        (a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      );

      setMovies(sorted);
      setFiltered(sorted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMovies(); }, []);

  // Filtrer selon recherche
  useEffect(() => {
    if (!searchQuery) {
      setFiltered(movies);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(
      movies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.overview?.toLowerCase().includes(q) ?? false) ||
        (m.release_date?.includes(q) ?? false)
      )
    );
  }, [searchQuery, movies]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      <h1 className="text-3xl font-bold mb-4">🎬 Sorties cinéma – Toulouse</h1>
      <p className="text-muted-foreground mb-6">
        Films actuellement en salle (source : TMDB).
      </p>

      {/* Barre d’actions */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={fetchMovies} disabled={loading}>
          {loading ? "Chargement..." : "📡 Actualiser"}
        </Button>

        <Button onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}>
          📺 Vue cartes
        </Button>

        <Button onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}>
          🔲 Vue liste
        </Button>

        <input
          type="text"
          placeholder="Rechercher un film..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-4 sm:mt-0 w-full p-2 border rounded focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <p className="mb-4 text-sm text-gray-600">Films affichés : {filtered.length}</p>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-400 rounded mb-6">
          {error}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <p className="text-muted-foreground">Aucun film trouvé.</p>
      )}

      {/* Vue cartes */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((film) => (
            <div
              key={film.id}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[500px]"
            >
              <img
                src={getMovieImage(film.title, film.poster_path)}
                alt={film.title}
                className="w-full h-60 object-cover"
              />

              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{film.title}</h2>

                <p className="text-sm text-blue-600 font-medium mb-1">
                  📅 {formatDate(film.release_date)}
                </p>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-4">
                  {film.overview || "Pas de synopsis disponible."}
                </p>

                <a
                  href={`https://www.themoviedb.org/movie/${film.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mb-1"
                >
                  🔗 Voir sur TMDB
                </a>

                <p className="text-xs text-muted-foreground mt-auto">
                  Source : TMDB
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vue liste */
        <div className="flex flex-col gap-4">
          {filtered.map((film) => (
            <div
              key={film.id}
              className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3"
            >
              <img
                src={getMovieImage(film.title, film.poster_path)}
                alt={film.title}
                className="w-full sm:w-40 h-36 object-cover rounded"
              />

              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold mb-1">{film.title}</h2>

                <p className="text-sm text-blue-600 font-medium mb-1">
                  📅 {formatDate(film.release_date)}
                </p>

                <p className="text-sm text-muted-foreground mb-1 line-clamp-4">
                  {film.overview}
                </p>

                <a
                  href={`https://www.themoviedb.org/movie/${film.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mb-1"
                >
                  🔗 Voir sur TMDB
                </a>

                <p className="text-xs text-muted-foreground mt-auto">
                  Source : TMDB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
