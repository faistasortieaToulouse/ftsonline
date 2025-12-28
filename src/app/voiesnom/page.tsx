"use client";

import { useEffect, useState, useMemo } from "react";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
  wikipedia?: string | null; // ajout pour fusion avec route.ts
}

export default function VoiesPage() {
  const [voies, setVoies] = useState<Voie[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/voiesnom")
      .then(res => res.json())
      .then(setVoies)
      .catch(console.error);
  }, []);

  // Filtrage avec recherche
  const filteredVoies = useMemo(() =>
    voies.filter(v =>
      v.libelle.toLowerCase().includes(search.toLowerCase()) ||
      v.libelle_occitan?.toLowerCase().includes(search.toLowerCase()) ||
      v.quartier.toLowerCase().includes(search.toLowerCase())
    ),
    [search, voies]
  );

  // Statistiques
  const totalQuartiers = useMemo(() => new Set(voies.map(v => v.quartier)).size, [voies]);
  const totalTerritoires = useMemo(() => new Set(voies.map(v => v.territoire)).size, [voies]);
  const totalOrigines = useMemo(() =>
    voies.filter(v => v.complement || v.complement_occitan).length, [voies]
  );
  const totalWikipedia = useMemo(() =>
    voies.filter(v => v.wikipedia).length, [voies]
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🛣️ Nomenclature des voies de Toulouse
      </h1>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une voie, un quartier, un nom occitan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-purple-200"
        />
      </div>

      {/* Statistiques */}
      <div className="mb-4 text-sm text-gray-600 space-y-1">
        <p>Total voies : {voies.length}</p>
        <p>Voies affichées : {filteredVoies.length}</p>
        <p>Quartiers uniques : {totalQuartiers}</p>
        <p>Territoires uniques : {totalTerritoires}</p>
        <p>Voies avec origine du nom : {totalOrigines}</p>
        <p>Voies avec résumé Wikipédia : {totalWikipedia}</p>
      </div>

      {/* Liste des voies */}
      <ul className="space-y-4">
        {filteredVoies.map((v, i) => (
          <li
            key={v.id}
            className="p-5 border rounded-lg bg-white shadow hover:shadow-lg transition"
          >
            <p className="text-lg font-bold text-purple-900">
              {i + 1}. {v.libelle}
            </p>

            {v.libelle_occitan && (
              <p className="italic text-purple-700">{v.libelle_occitan}</p>
            )}

            <p className="mt-2 text-sm text-gray-700">
              <strong>Quartier :</strong> {v.quartier}<br />
              <strong>Territoire :</strong> {v.territoire}
            </p>

            {(v.complement || v.complement_occitan) && (
              <div className="mt-4 pt-3 border-t border-purple-200 text-sm">
                <p className="font-semibold text-purple-700 mb-1">Origine du nom</p>
                {v.complement && <p className="text-gray-700">{v.complement}</p>}
                {v.complement_occitan && (
                  <p className="italic text-purple-600 mt-1">{v.complement_occitan}</p>
                )}
              </div>
            )}

            {v.wikipedia && (
              <div className="mt-4 pt-3 border-t border-purple-200 text-sm">
                <p className="font-semibold text-purple-700 mb-1">Wikipédia</p>
                <p className="text-gray-700">{v.wikipedia}</p>
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">STI : {v.sti}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
