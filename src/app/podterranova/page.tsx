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
    async function fetchPodcasts() {
      setLoading(true);
      try {
        const res = await fetch("/api/podterranova");
        if (!res.ok) throw new Error("Erreur lors du chargement du cache");
        const data = await res.json();
        setEpisodes(data.data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchPodcasts();
  }, []);

  if (loading) return <p>Chargement des podcasts...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h1>🎙️ Terra Nova — Podcasts</h1>
      {episodes.map((ep, idx) => (
        <div key={idx} style={{ marginBottom: "2rem" }}>
          <h2>{ep.titre}</h2>
          <p><strong>Date :</strong> {new Date(ep.date).toLocaleString()}</p>
          <p dangerouslySetInnerHTML={{ __html: ep.description }} />
          <audio controls src={ep.audioUrl}></audio>
        </div>
      ))}
    </div>
  );
}
