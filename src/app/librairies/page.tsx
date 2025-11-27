  // src/app/librairies/page.tsx
"use client";

import { useEffect, useState } from "react";
import LibrairiesClient from "@/components/LibrairiesClient";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

export default function PodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [librairie, setLibrairie] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  async function fetchEpisodes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(query ? { q: query } : {}),
        ...(librairie ? { librairie } : {}),
      });
      const res = await fetch(`/api/podcasts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEpisodes(data.data);
        setTotalPages(data.metadata.totalPages);
      }
    } catch (err) {
      console.error("Erreur récupération podcasts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEpisodes();
  }, [page, query, librairie]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Podcasts</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Recherche…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <LibrairiesClient selected={librairie} onSelect={setLibrairie} />
        <button
          onClick={() => { setPage(1); fetchEpisodes(); }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </div>

      {loading ? (
        <p>Chargement des épisodes…</p>
      ) : episodes.length === 0 ? (
        <p>Aucun épisode trouvé.</p>
      ) : (
        <ul className="space-y-4">
          {episodes.map((ep) => (
            <li key={`${ep.librairie}-${ep.titre}`} className="border p-4 rounded">
              <h2 className="font-semibold">{ep.titre}</h2>
              <p className="text-sm text-gray-600">{new Date(ep.date).toLocaleString()}</p>
              <p className="mt-2">{ep.description}</p>
              {ep.audioUrl && (
                <audio controls src={ep.audioUrl} className="mt-2 w-full">
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              )}
              <p className="mt-1 text-xs text-gray-500">{ep.librairie}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
