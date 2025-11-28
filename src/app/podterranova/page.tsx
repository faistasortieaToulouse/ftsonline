"use client";

import { useEffect, useState } from "react";

interface PodcastEpisode {
  titre: string;
  date: string;
  description: string;
  audioUrl: string;
}

export default function PodTerraNovaPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/podterranova");
        if (!res.ok) {
          throw new Error(`Erreur ${res.status} lors du chargement du cache`);
        }

        const json = await res.json();

        if (!json.data || !Array.isArray(json.data)) {
          throw new Error("Données invalides reçues de l'API");
        }

        setEpisodes(json.data);
      } catch (err: any) {
        console.error("Erreur fetchPodcasts:", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  if (loading) return <p>Chargement des podcasts...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <main style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🎙️ Terra Nova — Podcasts</h1>

      {episodes.length === 0 ? (
        <p>Aucun épisode disponible pour le moment.</p>
      ) : (
        episodes.map((ep, idx) => (
          <article key={idx} style={{ marginBottom: "2rem" }}>
            <h2>{ep.titre}</h2>
            <p><strong>Date :</strong> {new Date(ep.date).toLocaleString()}</p>
            <div dangerouslySetInnerHTML={{ __html: ep.description }} />
            <audio controls src={ep.audioUrl} style={{ marginTop: "0.5rem", width: "100%" }} />
          </article>
        ))
      )}
    </main>
  );
}
