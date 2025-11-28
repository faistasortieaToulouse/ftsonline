"use client";

import { useEffect, useState, useMemo } from "react";
// Importation de lodash.debounce pour optimiser la recherche
import debounce from "lodash.debounce"; 

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string; // Format ISO ou PubDate pour être parsé par new Date()
  audioUrl: string; // URL du fichier audio (enclosureUrl)
  description: string; // Contient souvent du HTML
}

// Liste des librairies pour le filtre
const LIBRAIRIES = [
  "Librairie Mollat",
  "Ombres Blanches",
  "Terra Nova",
  "Marathon des Mots",
];

// Interface de réponse de l'API (assumant { data: [...] })
interface ApiResponse {
    data: PodcastEpisode[];
}

export default function LibrairiesClient() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingCache, setUpdatingCache] = useState(false); // Nouvel état pour la mise à jour du cache
  const [error, setError] = useState<string | null>(null);
  const [selectedLibrairie, setSelectedLibrairie] = useState("Toutes les librairies");
  const [search, setSearch] = useState("");

  // --- Fetch podcasts from API ---
  async function fetchEpisodes() {
    setLoading(true);
    setError(null);

    // NOTE: Vérifiez que cette route est bien "/api/podcasts" si vous voyez des logs pour "/api/podmat"
    const apiPath = `/api/podcasts?limit=50`;

    try {
      const res = await fetch(apiPath); 
      
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status} - ${res.statusText}`);
      }
      
      const data: ApiResponse = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        setEpisodes(data.data);
        setFilteredEpisodes(data.data);
      } else {
        throw new Error("Format de données inattendu de l'API.");
      }
      
    } catch (err: any) {
      console.error(`Erreur de chargement des podcasts depuis ${apiPath}:`, err);
      // Indiquer clairement à l'utilisateur que le cache peut être la cause
      setError(err.message || "Erreur inconnue lors du chargement des épisodes. Essayez de mettre à jour le Cache.");
    } finally {
      setLoading(false);
    }
  }

  // --- New Function: Force Cache Update and then fetch episodes ---
  async function handleUpdateCache() {
    setUpdatingCache(true);
    setError(null);
    console.log("Tentative de forcer la mise à jour du cache...");

    try {
      // Appel direct de la route serveur pour générer un nouveau fichier cache
      const res = await fetch("/api/podcasts/update-cache");
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Échec de la mise à jour du cache. Réponse du serveur : ${errorText.substring(0, 100)}...`);
      }
      
      console.log("Cache mis à jour avec succès. Rechargement des épisodes...");
      // Recharger les données fraîches après une mise à jour réussie
      await fetchEpisodes();
      
    } catch (err: any) {
      console.error('Erreur de Mise à Jour du Cache:', err);
      // Message d'erreur ciblé pour l'utilisateur
      setError(err.message || "Erreur critique lors de la mise à jour du cache. Vérifiez les logs pour l'erreur 'Connection Refused' (errno: -111) indiquant un problème avec les flux RSS distants.");
    } finally {
      setUpdatingCache(false);
    }
  }


  // --- Client-side filtering (debounced for search) ---
  const filterEpisodes = useMemo(
    () =>
      debounce(() => {
        let filtered = episodes;

        // 1. Filter by library
        if (selectedLibrairie !== "Toutes les librairies") {
          filtered = filtered.filter(ep => ep.librairie === selectedLibrairie);
        }

        // 2. Filter by search (title and description)
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

  // Load data once on mount
  useEffect(() => {
    fetchEpisodes();
  }, []);

  // Filter whenever search or library changes
  useEffect(() => {
    filterEpisodes();
    return () => {
      // Clear debounce when unmounting or dependencies change
      filterEpisodes.cancel();
    };
  }, [selectedLibrairie, search, filterEpisodes]);

  // Fonction pour un affichage sécurisé de la date
  const formatDate = (dateString: string) => {
    try {
      // Tente de créer un objet Date avec la chaîne reçue
      const date = new Date(dateString);
      // Vérifie si la date est valide
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      // Formate la date
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Date invalide";
    }
  };


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

      {/* Search and dropdown menu bar */}
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
        
        {/* Nouveau Bouton : Mise à jour du Cache Serveur */}
        <button
          onClick={handleUpdateCache}
          disabled={loading || updatingCache}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-400"
        >
          {updatingCache ? 'Mise à jour du Cache...' : '⚡ Mettre à jour le Cache'}
        </button>

        {/* Ancien Bouton : Rafraîchir les données depuis le Cache */}
        <button
          onClick={fetchEpisodes}
          disabled={loading || updatingCache}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition duration-150 shadow-md disabled:bg-gray-400"
        >
          {loading ? 'Chargement...' : '🔄 Rafraîchir les données'}
        </button>
      </div>

      {/* Status Messages */}
      {loading && <p className="text-center py-12 text-xl text-indigo-600 font-medium">Chargement des podcasts en cours...</p>}
      {error && <p className="text-center py-12 text-xl text-red-600 font-bold border-2 border-red-400 bg-red-100 rounded-xl">⚠️ Erreur : {error}</p>}
      
      {!loading && !error && filteredEpisodes.length === 0 && (
        <p className="text-center py-12 text-xl text-gray-500">
          Aucun épisode trouvé correspondant aux filtres.
        </p>
      )}

      {/* Podcast List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEpisodes.map((ep, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-200 transform hover:scale-[1.01]"
          >
            <div className="p-5 flex flex-col flex-1">
              {/* Titre et Librairie */}
              <div className="mb-3">
                {/* Affiche le titre du podcast, avec un fallback au nom de la librairie si le titre est vide */}
                <h2 className="text-lg font-bold mb-1 line-clamp-2 text-gray-900">
                  {ep.titre || `Épisode de ${ep.librairie}`}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{ep.librairie}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(ep.date)}
                </p>
              </div>

              {/* Description (Using dangerouslySetInnerHTML) */}
              <div 
                className="text-sm text-gray-700 mb-4 flex-1 overflow-hidden line-clamp-4"
                // ATTENTION: N'utiliser que des sources de contenu de confiance.
                dangerouslySetInnerHTML={{ __html: ep.description }}
              />

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
