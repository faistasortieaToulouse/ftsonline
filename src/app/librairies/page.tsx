"use client";

import { useEffect, useState, useMemo } from "react";
import debounce from "lodash.debounce";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const LIBRAIRIES = [
  "Marathon des mots",
  "Ombres Blanches",
  "Terra Nova",
];

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
      const res = await fetch(`/api/podcasts?limit=50`);
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`);
      const data = await res.json();
      setEpisodes(data.data || []);
      setFilteredEpisodes(data.data || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  // --- Filtrage côté client (debounced pour la recherche) ---
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

  // Filtrer chaque fois que search ou librairie change
  useEffect(() => {
    filterEpisodes();
  }, [selectedLibrairie, search, filterEpisodes]);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Podcasts des Librairies Toulousaines</h1>
        <p className="text-gray-700">
          Rencontres et conférences des librairies Ombres Blanches, Terra Nova, Marathon des mots et Librairie Mollat.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Total de podcasts : {episodes.length}
        </p>
      </div>

      {/* Barre de recherche et menu déroulant */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un podcast..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-4 py-2 flex-1"
        />
        <select
          value={selectedLibrairie}
          onChange={e => setSelectedLibrairie(e.target.value)}
          className="border rounded px-4 py-2"
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {/* Messages d’état */}
      {loading && <p className="text-center py-4">Chargement des podcasts…</p>}
      {error && <p className="text-center py-4 text-red-600">Erreur : {error}</p>}
      {filteredEpisodes.length === 0 && !loading && !error && (
        <p className="text-center py-4">Aucun épisode trouvé.</p>
      )}

      {/* Liste des podcasts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpisodes.map((ep, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
          >
            <div className="p-4 flex flex-col flex-1">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">{ep.titre}</h2>
              <p className="text-sm text-gray-600 mb-2 flex-1 line-clamp-4">{ep.description}</p>
              <p className="text-xs text-gray-400 mb-2">
                {new Date(ep.date).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                — {ep.librairie}
              </p>
              {ep.audioUrl && (
                <audio controls className="w-full mt-auto rounded">
                  <source src={ep.audioUrl} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l’élément audio.
                </audio>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
