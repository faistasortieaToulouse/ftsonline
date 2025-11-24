"use client";

import React, { useState, useMemo, useEffect } from "react";

interface CategorieItem {
  label: string;
  url: string;
  description?: string;
  image?: string;
  [key: string]: any;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x200?text=Côté+Toulouse";

export default function CoteToulousePage() {
  const [categories, setCategories] = useState<CategorieItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/cotetoulouse");
        const data = await res.json();
        if (data.error) {
          setError(data.details || "Erreur API Côté Toulouse");
          setCategories([]);
        } else {
          setCategories(data.records || []);
        }
      } catch (err) {
        console.error("Erreur chargement Côté Toulouse", err);
        setError("Impossible de charger les rubriques.");
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((c) =>
      Object.values(c).some((val) =>
        val?.toString().toLowerCase().includes(q)
      )
    );
  }, [categories, search]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-purple-700">
        📚 Liens Côté Toulouse (Rubriques)
      </h1>

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher par titre, description, url..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 p-3 border rounded-md text-sm"
      />

      {/* Toggle plein écran / vignettes */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded ${
            viewMode === "card"
              ? "bg-purple-700 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📺 Plein écran
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded ${
            viewMode === "list"
              ? "bg-purple-700 text-white shadow"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          🔲 Vignettes
        </button>
      </div>

      {/* Compteur */}
      <p className="mb-4 font-semibold">
        Rubriques trouvées : {filtered.length}
      </p>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filtered.length === 0 && !error && (
        <p>Aucune rubrique trouvée.</p>
      )}

      {/* Affichage Cards */}
      {viewMode === "card" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              <img
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.label}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="font-bold text-lg text-purple-700 mb-2">{item.label}</h2>
              {item.description && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                  {item.description}
                </p>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto bg-purple-700 text-white py-2 px-3 rounded text-center hover:bg-purple-800"
              >
                🔗 Voir
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Affichage Liste */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-white border rounded shadow"
            >
              <img
                src={item.image || PLACEHOLDER_IMAGE}
                alt={item.label}
                className="w-24 h-24 rounded object-cover flex-shrink-0"
              />
              <div className="flex flex-col flex-1">
                <h2 className="font-semibold text-purple-700">{item.label}</h2>
                {item.description && (
                  <p className="text-sm text-gray-700 line-clamp-3">{item.description}</p>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-purple-700 underline text-sm"
                >
                  Voir →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
