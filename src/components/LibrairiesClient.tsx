// src/app/librairies/LibrairiesClient.tsx
"use client";

import { useEffect, useState } from "react";

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

interface Metadata {
  totalEpisodes: number;
  page: number;
  limit: number;
  totalPages: number;
  lastUpdated: string;
}

export default function LibrairiesClient() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [librairieFilter, setLibrairieFilter] = useState("");
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const limit = 10; // par page

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(query ? { q: query } : {}),
        ...(librairieFilter ? { librairie: librairieFilter } : {}),
      });

      const res = await fetch(`/api/podcasts?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEpisodes(data.data);
        setMetadata(data.metadata);
      } else {
        setEpisodes([]);
        setMetadata(null);
      }
    } catch (err) {
      console.error("Erreur fetch podcasts:", err);
      setEpisodes([]);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpisodes();
  }, [page, query, librairieFilter]);

  const handleNext = () => {
    if (metadata && page < metadata.totalPages) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <select
          value={librairieFilter}
          onChange={e => setLibrairieFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Toutes les librairies</option>
          <option value="Ombres Blanches">Ombres Blanches</option>
          <option value="Marathon des mots">Marathon des mots</option>
          <option value="Librairie Mollat">Librairie Mollat</option>
          <option value="Terra Nova">Terra Nova</option>
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : episodes.length === 0 ? (
        <p>Aucun épisode trouvé.</p>
      ) : (
        <ul className="space-y-4">
          {episodes.map((ep, idx) => (
            <li key={idx} className="border rounded p-3 shadow-sm">
              <h3 className="font-semibold">{ep.titre}</h3>
              <p className="text-sm text-gray-500">{ep.librairie} – {new Date(ep.date).toLocaleDateString()}</p>
              <p className="mt-1">{ep.description}</p>
              {ep.audioUrl && (
                <audio controls className="mt-2 w-full">
                  <source src={ep.audioUrl} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l’élément audio.
                </audio>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-4">
        <button onClick={handlePrev} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">
          Précédent
        </button>
        <span>
          Page {page} {metadata ? `sur ${metadata.totalPages}` : ""}
        </span>
        <button
          onClick={handleNext}
          disabled={metadata ? page >= metadata.totalPages : true}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
