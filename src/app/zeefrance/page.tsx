"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ZeeFrancePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/zeefrance")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) {
    return (
      <main className="p-8">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      {/* Bouton retour */}
      <Link
        href="/"
        className="inline-block mb-8 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
      >
        ← Retour à l'accueil
      </Link>

      <div className="bg-white border rounded-2xl shadow-sm p-8">
        <header className="mb-6">
          <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">
            {data.sujet}
          </span>
          <h1 className="text-3xl font-bold mt-2 text-slate-900">
            {data.titre}
          </h1>
        </header>

        <p className="text-slate-600 mb-8">
          Consultez les détails complets sur l'espace maritime et la juridiction 
          exclusive de la France sur l'encyclopédie libre.
        </p>

        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          Voir l'article Wikipedia
          <svg 
            className="ml-2 w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </main>
  );
}
