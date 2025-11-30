"use client";

import { useEffect, useState } from "react";

interface PodcastEpisode {
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

export default function PodMollatPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/podmollat2");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Erreur inconnue");
        setEpisodes(json.data || []);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des épisodes");
      } finally {
        setLoading(false);
      }
    }
    fetchEpisodes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Date invalide"
      : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Podcasts - Librairie Mollat</h1>
      <p className="text-gray-700 mb-6">Émissions, conférences et lectures de la Librairie Mollat.</p>
      <p className="mb-6 font-medium">
        Total d'épisodes chargés : <span className="font-bold text-indigo-600">{episodes.length}</span>
      </p>

      {loading && <p className="text-indigo-600 font-medium">Chargement des podcasts…</p>}
      {error && <p className="text-red-600 font-bold">⚠️ Erreur : {error}</p>}
      {!loading && !error && episodes.length === 0 && <p>Aucun épisode trouvé.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((ep, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-md flex flex-col h-full">
            <h2 className="font-bold mb-2">{ep.titre}</h2>
            <p className="text-sm text-gray-500 mb-2">{formatDate(ep.date)}</p>
            <div className="text-sm text-gray-700 flex-1 mb-2" dangerouslySetInnerHTML={{ __html: ep.description }} />
            {ep.audioUrl ? (
              <audio controls className="w-full mt-auto">
                <source src={ep.audioUrl} type="audio/mpeg" />
                Votre navigateur ne supporte pas l’élément audio.
              </audio>
            ) : (
              <p className="text-sm text-red-500 font-medium">Fichier audio non disponible.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
