"use client";

import { useEffect, useState, useMemo } from "react";
// Assurez-vous d'avoir installé lodash.debounce: npm install lodash.debounce
import debounce from "lodash.debounce"; 

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string; // URL du fichier audio (enclosureUrl)
  description: string;
}

const LIBRAIRIES = [
  "Librairie Mollat",
  "Ombres Blanches",
  "Terra Nova",
  "Marathon des Mots", // Ajout de votre podcast
];

// Interface de réponse si l'API retourne un objet avec une clé 'data'
interface ApiResponse {
    data: PodcastEpisode[];
}

export default function LibrairiesClient() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLibrairie, setSelectedLibrairie] = useState("Toutes les librairies");
  const [search, setSearch] = useState("");

  // --- Fetch podcasts depuis l'API ---
  async function fetchEpisodes() {
    setLoading(true);
    setError(null);

    try {
      // Appel de votre API qui agrège les flux RSS
      const res = await fetch(`/api/podcasts?limit=50`); 
      
      if (!res.ok) {
        throw new Error(`Erreur API : ${res.status} - ${res.statusText}`);
      }
      
      const data: ApiResponse = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        setEpisodes(data.data);
        // Initialiser les épisodes filtrés
        setFilteredEpisodes(data.data);
      } else {
        throw new Error("Format de données inattendu de l'API.");
      }
      
    } catch (err: any) {
      // Note : L'erreur du build (ECONNREFUSED) sera visible ici si l'appel API échoue au runtime
      console.error('Erreur de chargement des podcasts:', err);
      setError(err.message || "Erreur inconnue lors du chargement des épisodes.");
    } finally {
      setLoading(false);
    }
  }

  // --- Filtrage côté client (debounced pour la recherche) ---
  const filterEpisodes = useMemo(
    () =>
      debounce(() => {
        let filtered = episodes;

        // 1. Filtrage par librairie
        if (selectedLibrairie !== "Toutes les librairies") {
          filtered = filtered.filter(ep => ep.librairie === selectedLibrairie);
        }

        // 2. Filtrage par recherche (titre et description)
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

  // Charger les données une seule fois
  useEffect(() => {
    fetchEpisodes();
  }, []);

  // Filtrer chaque fois que search ou librairie change
  useEffect(() => {
    filterEpisodes();
    return () => {
      // Nettoyer le debounce lors du démontage ou changement de dépendance
      filterEpisodes.cancel();
    };
  }, [selectedLibrairie, search, filterEpisodes]);

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Podcasts des Librairies Toulousaines</h1>
        <p className="text-gray-700 text-lg">
          Rencontres, conférences et lectures du Marathon des Mots, Ombres Blanches, Terra Nova et Librairie Mollat.
        </p>
        <p className="mt-4 text-base text-gray-500 font-medium">
          Total d'épisodes chargés : <span className="font-bold text-indigo-600">{episodes.length}</span>
        </p>
      </div>

      {/* Barre de recherche et menu déroulant */}
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
            <option key={i} value={lib}>
              {lib}
            </option>
          ))}
        </select>
        <button
          onClick={fetchEpisodes}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-400"
        >
          {loading ? 'Chargement...' : '🔄 Rafraîchir'}
        </button>
      </div>

      {/* Messages d’état */}
      {loading && <p className="text-center py-12 text-xl text-indigo-600 font-medium">Chargement des podcasts en cours...</p>}
      {error && <p className="text-center py-12 text-xl text-red-600 font-bold border-2 border-red-400 bg-red-100 rounded-xl">⚠️ Erreur : {error}</p>}
      
      {!loading && !error && filteredEpisodes.length === 0 && (
        <p className="text-center py-12 text-xl text-gray-500">
          Aucun épisode trouvé correspondant aux filtres.
        </p>
      )}

      {/* Liste des podcasts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEpisodes.map((ep, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-200 transform hover:scale-[1.01]"
          >
            <div className="p-5 flex flex-col flex-1">
              {/* Titre et Librairie */}
              <div className="mb-3">
                <h2 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">{ep.titre}</h2>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{ep.librairie}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(ep.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Description */}
              {/* Utilisation de line-clamp pour une description propre */}
              <p className="text-sm text-gray-700 mb-4 flex-1 overflow-hidden line-clamp-4">
                {ep.description}
              </p>

              {/* Lecteur Audio */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                {ep.audioUrl ? (
                  // Balise audio stylisée et responsive
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
