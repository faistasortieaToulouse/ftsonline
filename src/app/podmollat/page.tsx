"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

// Librairies disponibles
const LIBRAIRIES = [
  "Librairie Mollat",
  "Ombres Blanches",
  "Terra Nova",
  "Marathon des Mots",
];

// API endpoints pour chaque librairie
const API_MAP: Record<string, string> = {
  "Librairie Mollat": "/api/podcasts?librairie=Librairie Mollat",
  "Ombres Blanches": "/api/podcasts?librairie=Ombres Blanches",
  "Terra Nova": "/api/podterranova",
  "Mollat": "/api/podmollat",
  "Marathon des Mots": "/api/podcasts?librairie=Marathon des Mots",
};

export default function LibrairiesPodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingCache, setUpdatingCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLibrairie, setSelectedLibrairie] = useState("Toutes les librairies");
  const [search, setSearch] = useState("");

  // --- Fetch podcasts ---
  async function fetchEpisodes() {
    setLoading(true);
    setError(null);
    let allEpisodes: PodcastEpisode[] = [];

    try {
      for (const lib of LIBRAIRIES) {
        const res = await fetch(API_MAP[lib]);
        if (!res.ok) continue;

        const json = await res.json();
        const data = json.data || [];
        allEpisodes = allEpisodes.concat(
          data.map((ep: any) => ({ ...ep, librairie: lib }))
        );
      }

      setEpisodes(allEpisodes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setFilteredEpisodes(allEpisodes);
    } catch (err: any) {
      console.error("Erreur fetchEpisodes:", err);
      setError(err.message || "Erreur lors du chargement des épisodes.");
    } finally {
      setLoading(false);
    }
  }

  // --- Force cache update ---
  async function handleUpdateCache() {
    setUpdatingCache(true);
    setError(null);

    try {
      // On force la mise à jour uniquement pour Mollat ici, adapter si besoin pour d'autres
      const res = await fetch("/api/podmollat/update-cache");
      if (!res.ok) throw new Error("Échec de la mise à jour du cache Mollat.");

      await fetchEpisodes();
    } catch (err: any) {
      console.error("Erreur mise à jour cache:", err);
      setError(err.message || "Erreur lors de la mise à jour du cache.");
    } finally {
      setUpdatingCache(false);
    }
  }

  // --- Debounced filter ---
  const filterEpisodes = useMemo(
    () =>
      debounce(() => {
        let filtered = episodes;

        if (selectedLibrairie !== "Toutes les librairies") {
          filtered = filtered.filter(ep => ep.librairie === selectedLibrairie);
        }

        if (search.trim() !== "") {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            ep => ep.titre.toLowerCase().includes(s) || ep.description.toLowerCase().includes(s)
          );
        }

        setFilteredEpisodes(filtered);
      }, 400),
    [episodes, selectedLibrairie, search]
  );

  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    filterEpisodes();
    return () => filterEpisodes.cancel();
  }, [selectedLibrairie, search, filterEpisodes]);

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
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Podcasts des Librairies Toulousaines</h1>
        <p className="text-gray-700 text-lg">
          Rencontres, conférences et lectures du Marathon des Mots, Ombres Blanches, Mollat et Librairie Mollat.
        </p>
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
        <select
          value={selectedLibrairie}
          onChange={e => setSelectedLibrairie(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 appearance-none bg-white pr-8 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        >
          <option value="Toutes les librairies">Toutes les librairies</option>
          {LIBRAIRIES.map((lib, i) => (
            <option key={i} value={lib}>{lib}</option>
          ))}
        </select>

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
      </div>

      {loading && <p className="text-center py-12 text-xl text-indigo-600 font-medium">Chargement des podcasts en cours...</p>}
      {error && <p className="text-center py-12 text-xl text-red-600 font-bold border-2 border-red-400 bg-red-100 rounded-xl">⚠️ Erreur : {error}</p>}
      {!loading && !error && filteredEpisodes.length === 0 && (
        <p className="text-center py-12 text-xl text-gray-500">Aucun épisode trouvé correspondant aux filtres.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEpisodes.map((ep, i) => (
          <div key={i} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-200 transform hover:scale-[1.01]">
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">{ep.titre}</h2>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{ep.librairie}</p>
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
