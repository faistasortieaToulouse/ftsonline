// src/app/podmollat2/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Episode {
  guid: string;
  titre: string;
  date: string;
  description: string;
  audioUrl: string;
  image?: string | null;
  link?: string | null;
}

export default function PodMollat() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        const res = await fetch("/api/podcasts?librairie=Librairie Mollat");
        const json = await res.json();

        if (res.ok) {
          setEpisodes(json.data || []);
        } else {
          setError(json.error || "Erreur inconnue");
        }
      } catch (e: any) {
        setError(e.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, []);

  if (loading) return <p>Chargement des épisodes…</p>;
  if (error) return <p>⚠️ {error}</p>;
  if (!episodes.length) return <p>Aucun épisode trouvé.</p>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Podcasts — Librairie Mollat</h1>
      {episodes.map((ep, index) => (
        <div
          key={ep.guid || index}
          style={{ marginBottom: "2rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}
        >
          <h2>{ep.titre}</h2>
          <p>
            <strong>Date :</strong>{" "}
            {ep.date
              ? new Date(ep.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Date inconnue"}
          </p>
          <p>{ep.description}</p>
          {ep.audioUrl ? <audio controls src={ep.audioUrl} /> : <p>Fichier audio non disponible.</p>}
        </div>
      ))}
    </div>
  );
}
