'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PaysData = {
  pays: string;
  part: number;
  nombre: number | null;
};

type ReligionsData = {
  [key: string]: PaysData[];
};

export default function ReligionsMondePage() {
  const [data, setData] = useState<ReligionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/religionsmonde')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (!data) return <p className="text-center mt-10 text-red-500">Erreur lors du chargement des données</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-4xl font-bold mb-8 text-center">Religions dans le monde (2024)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data).map(([religion, countries]) => (
          <div
            key={religion}
            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
          >
            <div className="bg-blue-100 px-4 py-3 font-semibold text-lg">{religion.charAt(0).toUpperCase() + religion.slice(1)}</div>
            <ul className="divide-y divide-gray-200">
              {countries.map((c, index) => (
                <li
                  key={`${c.pays}-${index}`}
                  className="flex justify-between px-4 py-2 hover:bg-gray-50"
                >
                  <span>{c.pays}</span>
                  <span className="text-right">
                    {c.part.toLocaleString()}% | {c.nombre !== null ? c.nombre.toLocaleString() : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
