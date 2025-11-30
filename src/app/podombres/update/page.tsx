"use client";

import { useEffect, useState } from "react";

export default function UpdatePodombresCachePage() {
  const [status, setStatus] = useState("Mise à jour du cache en cours…");

  useEffect(() => {
    async function runUpdate() {
      try {
        const res = await fetch("/api/podombres/update-cache");
        const json = await res.json();

        if (!res.ok) {
          setStatus("Erreur : " + json.error);
        } else {
          setStatus(`Cache mis à jour avec succès (${json.totalEpisodes} épisodes)`);
        }
      } catch (e) {
        setStatus("Erreur réseau : " + e);
      }
    }

    runUpdate();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🛠 Mise à jour du cache — Ombres Blanches</h1>
      <p>{status}</p>
    </div>
  );
}
