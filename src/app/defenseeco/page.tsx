"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DefenseEcoPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/defenseeco")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) {
    return (
      <main className="p-8">
        <p className="animate-pulse text-slate-500">Chargement des données...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Bouton retour */}
      <Link
        href="/"
        className="inline-block mb-8 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition shadow-sm"
      >
        ← Retour à l'accueil
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900">
          Défense, Économie & Société
        </h1>
        <p className="text-slate-600 mt-2">
          Indicateurs mondiaux et statistiques internationales.
        </p>
      </header>

      <div className="grid gap-12">
        {Object.entries(data).map(([categorie, liens]: any) => (
          <section key={categorie}>
            <h2 className="text-2xl font-bold mb-6 capitalize text-slate-800 border-l-4 border-blue-600 pl-4">
              {categorie.replace(/_/g, " ")}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liens.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <h3 className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {item.titre}
                  </h3>
                  <div className="mt-4 flex items-center text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Consulter les données 
                    <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
