"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PodcastEpisode {
  titre: string;
  date: string;
  description: string;
  audioUrl: string;
}

export default function PodMarathonPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingCache, setUpdatingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // --- Fetch podcasts ---
  async function fetchEpisodes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/podmarathon");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur lors du chargement des épisodes.");
      setEpisodes(json.data);
      setFilteredEpisodes(json.data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  // --- Update cache ---
  async function handleUpdateCache() {
    setUpdatingCache(true);
    setError(null);
    try {
      const res = await fetch("/api/podmarathon/update-cache");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de la mise à jour du cache.");
      await fetchEpisodes();
    } catch (err: any) {
      setError(err.message || "Erreur mise à jour cache.");
    } finally {
      setUpdatingCache(false);
    }
  }

  // --- Debounced filter ---
  const filterEpisodes = useMemo(
    () =>
      debounce(() => {
        let filtered = episodes;
        if (search.trim() !== "") {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            ep => ep.titre.toLowerCase().includes(s) || ep.description.toLowerCase().includes(s)
          );
        }
        setFilteredEpisodes(filtered);
      }, 400),
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
      if (isNaN(date.getTime())) return "Date invalide";
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "Date invalide";
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

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Podcasts — Le Marathon des Mots</h1>
        <p className="text-gray-700 text-lg">Rencontres et conférences du Marathon des Mots.</p>
        <p className="mt-4 text-base text-gray-500 font-medium">
          Total d'épisodes chargés : <span className="font-bold text-indigo-600">{episodes.length}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
        <input
          type="text"
          placeholder="Rechercher un podcast par titre ou description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />

        <button
          onClick={handleUpdateCache}
          disabled={loading || updatingCache}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-400"
        >
          {updatingCache ? 'Mise à jour du Cache...' : '⚡ Mettre à jour le Cache'}
        </button>

        <button
          onClick={fetchEpisodes}
          disabled={loading || updatingCache}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-150 shadow-md disabled:bg-gray-400"
        >
          {loading ? 'Chargement...' : '🔄 Rafraîchir les données'}
        </button>

        <Link
          href="/podlibrairies"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-md flex items-center justify-center"
        >
          📚 Tous les Podcasts
        </Link>
      </div>

      {loading && <p className="text-center py-12 text-xl text-indigo-600 font-medium">Chargement des podcasts en cours...</p>}
      {error && <p className="text-center py-12 text-xl text-red-600 font-bold border-2 border-red-400 bg-red-100 rounded-xl">⚠️ Erreur : {error}</p>}
      {!loading && !error && filteredEpisodes.length === 0 && (
        <p className="text-center py-12 text-xl text-gray-500">Aucun épisode trouvé correspondant aux filtres.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEpisodes.map((ep, i) => (
          <div key={i} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-200 transform hover:scale-[1.01]">
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">{ep.titre}</h2>
                <p className="text-xs text-gray-500 mt-1">{formatDate(ep.date)}</p>
              </div>
              <div className="text-sm text-gray-700 mb-4 flex-1 overflow-hidden line-clamp-4" dangerouslySetInnerHTML={{ __html: ep.description }} />
              <div className="mt-auto pt-4 border-t border-gray-100">
                {ep.audioUrl ? (
                  <audio controls className="w-full h-10 rounded-full bg-gray-100 shadow-inner">
                    <source src={ep.audioUrl} type="audio/mpeg" />
                    Votre navigateur ne supporte pas l’élément audio.
                  </audio>
                ) : (
                  <p className="text-sm text-red-500 font-medium">Fichier audio non disponible.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
