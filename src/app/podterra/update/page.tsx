"use client";

import { useState } from "react";

export default function UpdateCachePage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runUpdate() {
    setLoading(true);
    setStatus("Mise à jour du cache…");
    try {
      const res = await fetch("/api/podterra/update-cache");
      const json = await res.json();

      if (!res.ok) {
        setStatus("⚠️ Erreur : " + (json.error || "Erreur inconnue"));
      } else {
        // Détermine le nombre d’épisodes mis à jour
        const total =
          json.totalEpisodes ??
          (json.episodes ? json.episodes.length : (json.data ? json.data.length : "inconnu"));

        setStatus(`✅ Cache mis à jour avec succès (${total} épisode${total > 1 ? "s" : ""})`);
      }
    } catch (err: any) {
      setStatus("⚠️ Erreur réseau : " + (err.message || err.toString()));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">
        🛠 Mise à jour du cache Terra Nova
      </h1>

      <button
        onClick={runUpdate}
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-gray-400 mb-6"
      >
        {loading ? "Mise à jour en cours..." : "⚡ Mettre à jour le cache"}
      </button>

      {status && (
        <p
          className={`p-4 rounded-lg border ${
            status.startsWith("✅")
              ? "bg-green-100 border-green-400 text-green-700"
              : status.startsWith("⚠️")
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-gray-100 border-gray-300 text-gray-700"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
