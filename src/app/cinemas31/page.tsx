'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Cinemas31Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Chargement des données
  useEffect(() => {
    async function fetchCinemas() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cinemas31");
        if (!res.ok) throw new Error("Erreur API interne");

        const data = await res.json();

        // Tri par nom_cinema
        const sorted = data.sort((a: any, b: any) =>
          (a.nom_cinema ?? "").localeCompare(b.nom_cinema ?? "")
        );

        setCinemas(sorted);
        setFiltered(sorted);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchCinemas();
  }, []);

  // Filtrage recherche
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      cinemas.filter(cin =>
        (cin.nom_cinema?.toLowerCase().includes(q) ?? false) ||
        (cin.nom_commune?.toLowerCase().includes(q) ?? false) ||
        (cin.adresse?.toLowerCase().includes(q) ?? false)
      )
    );
  }, [search, cinemas]);

  // Génère une clé unique sûre
  const getKey = (cin: any, index: number) =>
    (cin.ref_cnc && cin.ref_cnc !== "no")
      ? cin.ref_cnc
      : (cin.osm_id && cin.osm_id !== "no")
      ? cin.osm_id
      : `${cin.nom_cinema ?? "cinema"}-${cin.nom_commune ?? "no"}-${index}`;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Cinémas en Haute-Garonne</h1>
      <p className="text-muted-foreground mb-4">
        Données publiques "Les cinémas en Haute-Garonne".
      </p>

      {/* Boutons et recherche */}
      <div className="flex gap-3 flex-wrap mb-6 items-center">
        <Button onClick={() => window.location.reload()}>🔄 Recharger</Button>

        <Button
          onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}
        >
          📺 Plein écran
        </Button>

        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}
        >
          🔲 Vignettes
        </Button>

        <input
          className="w-full p-2 border rounded mt-4 sm:mt-0"
          placeholder="Rechercher un cinéma..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 mb-4">{error}</div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Cinémas affichés : {filtered.length}
      </p>

      {/* Mode Card */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cin, index) => (
            <div
              key={getKey(cin, index)}
              className="bg-white shadow rounded overflow-hidden flex flex-col h-[360px]"
            >
              <img
                src="/images/capidefaut.jpg"
                alt={cin.nom_cinema}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-1">{cin.nom_cinema}</h2>
                <p className="text-sm text-muted-foreground mb-1">
                  📍 {cin.adresse}, {cin.nom_commune}
                </p>
                {cin.nb_screens && (
                  <p className="text-sm text-blue-600 mb-1">
                    🎞️ {cin.nb_screens} écran(s)
                  </p>
                )}
                {cin.website && (
                  <a
                    href={cin.website}
                    target="_blank"
                    className="text-blue-600 underline text-sm"
                  >
                    🌐 Site web
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-auto">
                  Source : Data.haute-garonne.fr
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mode Liste
        <div className="flex flex-col gap-4">
          {filtered.map((cin, index) => (
            <div
              key={getKey(cin, index)}
              className="flex flex-col sm:flex-row bg-white shadow rounded p-3 gap-3"
            >
              <img
                src="/images/capidefaut.jpg"
                className="w-full sm:w-40 h-36 object-cover rounded"
              />
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-semibold">{cin.nom_cinema}</h2>
                <p className="text-sm text-muted-foreground mb-1">
                  📍 {cin.adresse}, {cin.nom_commune}
                </p>
                {cin.nb_screens && (
                  <p className="text-sm text-blue-600 mb-1">
                    🎞️ {cin.nb_screens} écran(s)
                  </p>
                )}
                {cin.website && (
                  <a
                    href={cin.website}
                    target="_blank"
                    className="text-blue-600 underline text-sm"
                  >
                    🌐 Site web
                  </a>
                )}
                <p className="text-xs text-muted-foreground mt-auto">
                  Source : Data.haute-garonne.fr
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
