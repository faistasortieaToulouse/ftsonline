"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PodcastEpisode {
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
  guid: string;
  image?: string | null;
  link?: string | null;
}

export default function PodOmbresPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingCache, setUpdatingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // --- Récupérer les épisodes ---
  async function fetchEpisodes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/podombres");
      const json = await res.json();

      if (!res.ok) {
        // Si l'API indique que le cache doit être créé
        if (json.needsUpdate) {
          return await handleUpdateCache();
        }
        throw new Error(json.error || "Erreur lors du chargement");
      }

      setEpisodes(json.data || []);
      setFilteredEpisodes(json.data || []);
    } catch (err: any) {
      console.error("Erreur fetchEpisodes:", err);
      setError(err.message || "Impossible de charger les podcasts.");
    } finally {
      setLoading(false);
    }
  }

  // --- Forcer la mise à jour du cache ---
  async function handleUpdateCache() {
    setUpdatingCache(true);
    setError(null);
    try {
      const res = await fetch("/api/podombres/update-cache");
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.error || "Échec de la mise à jour");
      
      // On rafraîchit les données après la mise à jour
      const refreshRes = await fetch("/api/podombres");
      const refreshJson = await refreshRes.json();
      
      setEpisodes(refreshJson.data || []);
      setFilteredEpisodes(refreshJson.data || []);
    } catch (err: any) {
      console.error("Erreur update cache:", err);
      setError("Erreur lors de la synchronisation du cache.");
    } finally {
      setUpdatingCache(false);
    }
  }

  // --- Filtrage avec debounce ---
  const filterEpisodes = useMemo(
    () =>
      debounce(() => {
        const s = search.toLowerCase();
        const filtered = episodes.filter(
          ep =>
            ep.titre.toLowerCase().includes(s) ||
            ep.description.toLowerCase().includes(s)
        );
        setFilteredEpisodes(filtered);
      }, 300),
    [episodes, search]
  );

  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    filterEpisodes();
    return () => filterEpisodes.cancel();
  }, [search, filterEpisodes]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date inconnue";
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Date inconnue";
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">
          Podcasts — Ombres Blanches
        </h1>
        <p className="text-gray-700 text-lg">
          Rencontres et conférences de la librairie Ombres Blanches.
        </p>
        <p className="mt-4 text-sm text-gray-500 font-medium bg-white inline-block px-3 py-1 rounded-full border">
          Total d'épisodes : <span className="text-indigo-600 font-bold">{episodes.length}</span>
        </p>
      </div>

      {/* BARRE DE FILTRES */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-10 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        <input
          type="text"
          placeholder="Rechercher un épisode..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />

        <div className="flex gap-2">
          <button
            onClick={handleUpdateCache}
            disabled={loading || updatingCache}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 shadow-md"
          >
            {updatingCache ? <Loader2 className="animate-spin h-4 w-4" /> : "⚡"}
            {updatingCache ? "Mise à jour..." : "Mettre à jour le Cache"}
          </button>

          <button
            onClick={fetchEpisodes}
            disabled={loading || updatingCache}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "🔄"}
            Rafraîchir
          </button>
        </div>

        <Link
          href="/podlibrairies"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition shadow-md text-center"
        >
          📚 Tous les Podcasts
        </Link>
      </div>

      {/* CHARGEMENT */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-100 mb-10">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-700 mb-4" />
          <p className="text-indigo-700 font-bold text-xl italic animate-pulse">
            🎧 Chargement des épisodes d'Ombres Blanches...
          </p>
        </div>
      )}

      {/* ERREUR */}
      {error && !loading && (
        <div className="text-center py-12 px-6 bg-red-50 border-2 border-red-200 rounded-xl mb-10">
          <p className="text-xl text-red-600 font-bold mb-2">⚠️ Oups !</p>
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* LISTE OU VIDE */}
      {!loading && (
        <>
          {filteredEpisodes.length === 0 && !error ? (
            <p className="text-center py-12 text-xl text-gray-500 italic bg-white rounded-xl border">
              Aucun épisode trouvé pour cette recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredEpisodes.map((ep, i) => (
                <div
                  key={ep.guid || i}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Conférence</p>
                      <h2 className="text-lg font-bold line-clamp-2 text-gray-900 leading-snug h-12">
                        {ep.titre}
                      </h2>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(ep.date)}</p>
                    </div>

                    <div
                      className="text-sm text-gray-600 mb-6 flex-1 line-clamp-4 leading-relaxed italic"
                      dangerouslySetInnerHTML={{ __html: ep.description }}
                    />

                    <div className="mt-auto pt-4 border-t border-gray-50">
                      {ep.audioUrl ? (
                        <audio controls preload="none" className="w-full h-10 rounded-full bg-gray-50">
                          <source src={ep.audioUrl} type="audio/mpeg" />
                          Audio non supporté.
                        </audio>
                      ) : (
                        <p className="text-xs text-red-400 font-medium italic text-center">
                          Lecteur non disponible
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
