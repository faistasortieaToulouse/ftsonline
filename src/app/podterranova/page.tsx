"use client";

import { useEffect, useState } from "react";

interface Episode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

// --- Pagination ---
const EPISODES_PER_PAGE = 12;

export default function PodTerraNovaPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Load cached data ---
  useEffect(() => {
    async function loadEpisodes() {
      try {
        const res = await fetch("/api/podcasts?limit=200");
        const json = await res.json();

        const data: Episode[] = json.data || [];

        // Tri du plus récent au plus ancien
        data.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Filtre : uniquement "Terra Nova"
        const terraEpisodes = data.filter(
          (ep) => ep.librairie === "Terra Nova"
        );

        setEpisodes(terraEpisodes);
      } catch (error) {
        console.error("Erreur chargement podcasts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEpisodes();
  }, []);

  // --- Pagination control ---
  const firstIndex = (currentPage - 1) * EPISODES_PER_PAGE;
  const currentEpisodes = episodes.slice(
    firstIndex,
    firstIndex + EPISODES_PER_PAGE
  );

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6">
        🎙️ Podcasts — Terra Nova
      </h1>

      {loading && (
        <p className="text-gray-500">Chargement des épisodes…</p>
      )}

      {!loading && currentEpisodes.length === 0 && (
        <p className="text-gray-400">
          Aucun épisode trouvé. Vérifiez que le cache est à jour.
        </p>
      )}

      <div className="space-y-8">
        {currentEpisodes.map((episode, index) => (
          <article
            key={index}
            className="border border-gray-700 rounded-lg p-5 bg-gray-900"
          >
            <h2 className="text-xl font-semibold mb-1">
              {episode.titre}
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              {new Date(episode.date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>

            <audio
              controls
              className="w-full mb-4"
              src={episode.audioUrl}
            />

            <div
              className="prose prose-invert"
              dangerouslySetInnerHTML={{
                __html: episode.description,
              }}
            />
          </article>
        ))}
      </div>

      {/* --- Pagination Buttons --- */}
      {totalPages > 1 && (
        <div className="flex gap-3 justify-center mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded bg-gray-700 disabled:opacity-40"
          >
            ← Précédent
          </button>

          <span className="px-3 py-2">
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded bg-gray-700 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
