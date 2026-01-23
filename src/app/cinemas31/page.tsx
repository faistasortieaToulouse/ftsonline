'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Cinemas31Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // Chargement des données + TRI PERSONNALISÉ
  useEffect(() => {
    async function fetchCinemas() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/cinemas31");
        if (!res.ok) throw new Error("Erreur API interne");

        const data = await res.json();

        const sorted = data.sort((a: any, b: any) => {
          const communeA = (a.nom_commune ?? "").toLowerCase();
          const communeB = (b.nom_commune ?? "").toLowerCase();

          const isToulouseA = communeA === "toulouse";
          const isToulouseB = communeB === "toulouse";

          // 1️⃣ Toulouse en premier
          if (isToulouseA && !isToulouseB) return -1;
          if (!isToulouseA && isToulouseB) return 1;

          // 2️⃣ Autres communes : ordre alphabétique
          if (communeA !== communeB) {
            return communeA.localeCompare(communeB);
          }

          // 3️⃣ Même commune : nom du cinéma
          return (a.nom_cinema ?? "").localeCompare(b.nom_cinema ?? "");
        });

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

  // Recherche
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

  // Clé React fiable
  const getKey = (cin: any, index: number) =>
    cin.ref_cnc && cin.ref_cnc !== "no"
      ? cin.ref_cnc
      : cin.osm_id && cin.osm_id !== "no"
      ? cin.osm_id
      : `${cin.nom_cinema}-${cin.nom_commune}-${index}`;

  return (
    <div className="container mx-auto py-8">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-2">🎬 Cinémas en Haute-Garonne</h1>
      <p className="text-muted-foreground mb-6">
        Données publiques — source : Data.haute-garonne.fr
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Button onClick={() => window.location.reload()}>🔄 Recharger</Button>

        <Button
          onClick={() => setViewMode("card")}
          variant={viewMode === "card" ? "default" : "secondary"}
        >
          🗂 Cartes
        </Button>

        <Button
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "default" : "secondary"}
        >
          📋 Liste
        </Button>

        <input
          className="w-full sm:w-64 p-2 border rounded"
          placeholder="Rechercher un cinéma…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* États */}
      {loading && <p className="text-sm text-gray-500">Chargement…</p>}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 mb-4">{error}</div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Cinémas affichés : {filtered.length}
      </p>

      {/* Vue cartes */}
      {viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cin, index) => (
            <div
              key={getKey(cin, index)}
              className="bg-white shadow rounded p-4 flex flex-col"
            >
              <h2 className="text-lg font-semibold mb-1">
                🎥 {cin.nom_cinema}
              </h2>

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
                  className="text-blue-600 underline text-sm mb-2"
                >
                  🌐 Site web
                </a>
              )}

              <p className="text-xs text-muted-foreground mt-auto">
                Source : Data.haute-garonne.fr
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Vue liste */
        <div className="flex flex-col gap-3">
          {filtered.map((cin, index) => (
            <div
              key={getKey(cin, index)}
              className="bg-white shadow rounded p-4"
            >
              <h2 className="text-lg font-semibold">
                🎥 {cin.nom_cinema}
              </h2>

              <p className="text-sm text-muted-foreground">
                📍 {cin.adresse}, {cin.nom_commune}
              </p>

              <div className="flex flex-wrap gap-4 mt-1">
                {cin.nb_screens && (
                  <span className="text-sm text-blue-600">
                    🎞️ {cin.nb_screens} écran(s)
                  </span>
                )}

                {cin.website && (
                  <a
                    href={cin.website}
                    target="_blank"
                    className="text-sm text-blue-600 underline"
                  >
                    🌐 Site web
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
