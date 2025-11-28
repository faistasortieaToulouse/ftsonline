"use client";

import { useEffect, useState } from "react";

type Episode = {
  guid: string;
  titre: string;
  date: string; // iso string ou pubDate
  description: string;
  audioUrl: string;
  image?: string | null;
  link?: string | null;
};

const EPISODES_PER_PAGE = 12;

export default function PodTerraNovaPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/podterranova");
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(
            json?.error ||
              `Erreur ${res.status} lors de la récupération du cache. Lancez /api/podterranova/update-cache.`
          );
          setEpisodes([]);
          return;
        }
        const json = await res.json();
        // Ton endpoint renvoie { data: episodes } d'après ce que tu avais.
        const data: Episode[] = json.data || json || [];
        // Tri décroissant par date
        const sorted = data.slice().sort((a, b) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return db - da;
        });
        setEpisodes(sorted);
      } catch (e) {
        console.error(e);
        setError("Erreur réseau lors de la récupération des épisodes.");
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(episodes.length / EPISODES_PER_PAGE));
  const start = (page - 1) * EPISODES_PER_PAGE;
  const pageEpisodes = episodes.slice(start, start + EPISODES_PER_PAGE);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🎙️ Terra Nova — Podcasts</h1>

      {loading && <p className="text-gray-600">Chargement…</p>}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Si le cache est absent, lancez <code>/api/podterranova/update-cache</code>.
          </p>
        </div>
      )}

      {!loading && !error && pageEpisodes.length === 0 && (
        <p className="text-gray-600">Aucun épisode disponible.</p>
      )}

      <div className="space-y-8 mt-6">
        {pageEpisodes.map((ep) => {
          const d = new Date(ep.date);
          // Format date et heure à la française
          const dateStr = isNaN(d.getTime())
            ? ep.date
            : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
          const timeStr = isNaN(d.getTime())
            ? ""
            : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

          return (
            <article key={ep.guid} className="border rounded-lg p-5 shadow-sm bg-white">
              <header className="mb-3">
                <h2 className="text-xl font-semibold">{ep.titre}</h2>
                <p className="text-sm text-gray-500">
                  {dateStr}
                  {timeStr ? ` — ${timeStr}` : ""}
                </p>
              </header>

              {ep.description ? (
                <div
                  className="prose mt-3"
                  dangerouslySetInnerHTML={{ __html: ep.description }}
                />
              ) : (
                <p className="text-gray-600">Pas de description.</p>
              )}

              <div className="mt-4">
                <audio
                  controls
                  className="w-full"
                  src={ep.audioUrl}
                  preload="none"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

              {ep.link && (
                <p className="mt-3">
                  <a
                    href={ep.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Voir la page de l'épisode
                  </a>
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
          >
            ← Précédent
          </button>

          <span>
            Page <strong>{page}</strong> / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded bg-gray-200 disabled:opacity-50"
          >
            Suivant →
          </button>
        </nav>
      )}
    </main>
  );
}
