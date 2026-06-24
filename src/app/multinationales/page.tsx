"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Multinationale {
  rang: number;
  entreprise: string;
  pays: string;
  secteur: string;
}

export default function MultinationalesPage() {
  const [entreprises, setEntreprises] = useState<Multinationale[]>([]);

  useEffect(() => {
    fetch("/api/multinationales")
      .then((res) => res.json())
      .then((data) => setEntreprises(data));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Top 120 des multinationales européennes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entreprises.map((entreprise) => (
          <div
            key={entreprise.rang}
            className="bg-white rounded-lg shadow-md border border-slate-200 p-5 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                #{entreprise.rang}
              </span>

              <span className="text-xs text-slate-500 font-medium">
                {entreprise.pays}
              </span>
            </div>

            <h2 className="font-bold text-lg text-slate-900 mb-2">
              {entreprise.entreprise}
            </h2>

            <div className="text-sm text-slate-600">
              {entreprise.secteur}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-700 bg-blue-50 p-4 rounded-md border border-blue-200">
        <p>
          <strong>Source :</strong> classement indicatif des principales
          multinationales européennes par capitalisation boursière.
        </p>
      </div>

    </div>
  );
}
