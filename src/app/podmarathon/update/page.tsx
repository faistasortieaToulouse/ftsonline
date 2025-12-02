"use client";

import { useEffect, useState } from "react";

export default function UpdatePodMarathonCache() {
  const [status, setStatus] = useState("Mise à jour du cache en cours…");

  useEffect(() => {
    async function runUpdate() {
      try {
        const res = await fetch("/api/podmarathon/update-cache", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          setStatus("Erreur : " + (json.error || "Erreur inconnue"));
        } else {
          // Le retour GitHub est inclus dans json.github
          const total = json.totalEpisodes ?? "?";
          setStatus(`✅ Cache mis à jour avec succès (${total} épisodes)`);
        }
      } catch (e: any) {
        setStatus("Erreur réseau : " + (e.message || e.toString()));
      }
    }

    runUpdate();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">🛠 Mise à jour du cache — Marathon des Mots</h1>
      <p className="text-gray-700 text-lg">{status}</p>
    </div>
  );
}
