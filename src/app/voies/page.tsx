"use client";

import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Voie {
  id: number;
  libelle: string;
  libelle_occitan?: string | null;
  quartier: string;
  territoire: string;
  complement?: string | null;
  complement_occitan?: string | null;
  sti: number;
}

export default function VoiesPage() {
  const [voies, setVoies] = useState<Voie[]>([]);
  const [search, setSearch] = useState("");
  const [onlyWithOrigin, setOnlyWithOrigin] = useState(false);

  useEffect(() => {
    fetch("/api/voies")
      .then((res) => res.json())
      .then(setVoies)
      .catch(console.error);
  }, []);

  // 🔹 Voies ayant une origine du nom
  const voiesAvecOrigine = useMemo(
    () =>
      voies.filter(
        (v) => v.complement && v.complement.trim() !== ""
      ),
    [voies]
  );

  // 🔹 Filtrage + recherche
  const filteredVoies = useMemo(() => {
    const base = onlyWithOrigin ? voiesAvecOrigine : voies;

    return base.filter((v) => {
      const q = search.toLowerCase();

      return (
        v.libelle.toLowerCase().includes(q) ||
        v.libelle_occitan?.toLowerCase().includes(q) ||
        v.quartier.toLowerCase().includes(q)
      );
    });
  }, [voies, voiesAvecOrigine, search, onlyWithOrigin]);

  return (
    <div className="p-4 max-w-6xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🛣️ Nomenclature des voies de Toulouse
      </h1>

      {/* 🔹 Statistiques + filtre */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-700">
          Total des voies : <strong>{voies.length}</strong>
        </p>
        <p className="text-sm text-gray-700">
          Voies avec origine du nom :{" "}
          <strong>{voiesAvecOrigine.length}</strong>
        </p>

        <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={onlyWithOrigin}
            onChange={() => setOnlyWithOrigin(!onlyWithOrigin)}
          />
          Afficher uniquement les voies avec une origine du nom
        </label>
      </div>

      {/* 🔍 Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher une voie, un quartier, un nom occitan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-purple-200"
        />
      </div>

      {/* Résultats */}
      <p className="mb-4 text-sm text-gray-600">
        {filteredVoies.length} voie(s) affichée(s)
      </p>

      <ul className="space-y-4">
        {filteredVoies.map((v, index) => (
          <li
            key={v.id}
            className="p-5 border rounded-lg bg-white shadow hover:shadow-lg transition"
          >
            <p className="text-lg font-bold text-purple-900">
              {index + 1}. {v.libelle}
            </p>

            {v.libelle_occitan && (
              <p className="italic text-purple-700">
                {v.libelle_occitan}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-700">
              <strong>Quartier :</strong> {v.quartier}
              <br />
              <strong>Territoire :</strong> {v.territoire}
            </p>

            {(v.complement || v.complement_occitan) && (
              <div className="mt-4 pt-3 border-t border-purple-200 text-sm">
                <p className="font-semibold text-purple-700 mb-1">
                  Origine du nom
                </p>

                {v.complement && (
                  <p className="text-gray-700">
                    {v.complement}
                  </p>
                )}

                {v.complement_occitan && (
                  <p className="italic text-purple-600 mt-1">
                    {v.complement_occitan}
                  </p>
                )}
              </div>
            )}

            <p className="mt-3 text-xs text-gray-400">
              STI : {v.sti}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
