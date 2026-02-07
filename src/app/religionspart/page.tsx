'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

type Statistique = {
  religion: string;
  nombre: number;
};

type ReligionsData = {
  titre: string;
  annee_estimation: number;
  source_unite: string;
  statistiques: Statistique[];
};

export default function ReligionsPartPage() {
  const [data, setData] = useState<ReligionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/religionspart')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Chargement...</p>;
  if (!data) return <p className="p-4">Erreur lors du chargement des données</p>;

  // Calcul du total mondial
  const total = data.statistiques.reduce((acc, s) => acc + s.nombre, 0);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-4">{data.titre} ({data.annee_estimation})</h1>
      <p className="mb-4 text-gray-600 italic">Source : {data.source_unite}</p>
      <p className="mb-6 font-semibold bg-gray-50 p-3 rounded border-l-4 border-blue-600 text-slate-800">
        Total mondial : {total.toLocaleString()} individus
      </p>

      <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-slate-700">
              <th className="border-b px-3 py-2 text-left text-sm font-bold uppercase tracking-wider">Religion</th>
              <th className="border-b px-3 py-2 text-right text-sm font-bold uppercase tracking-wider">Nombre d'individus</th>
              <th className="border-b px-3 py-2 text-right text-sm font-bold uppercase tracking-wider hidden md:table-cell">Pourcentage (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.statistiques.map((s, index) => (
              <ReligionRow key={`${s.religion}-${index}`} s={s} total={total} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReligionRow({ s, total, index }: { s: Statistique, total: number, index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pourcentage = ((s.nombre / total) * 100).toFixed(2);

  return (
    <>
      <tr 
        className="hover:bg-gray-50 transition-colors cursor-pointer md:cursor-default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="px-3 py-3 text-slate-800 font-medium">
          <div className="flex items-center justify-between">
            <span>{s.religion}</span>
            <span className="md:hidden text-slate-400">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 text-right text-slate-600 font-mono text-sm">
          {s.nombre.toLocaleString()}
        </td>
        <td className="px-3 py-3 text-right text-blue-700 font-bold hidden md:table-cell">
          {pourcentage}%
        </td>
      </tr>

      {/* Accordéon Mobile pour le Pourcentage */}
      {isOpen && (
        <tr className="md:hidden bg-blue-50/20">
          <td colSpan={2} className="px-3 py-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pourcentage (%)</span>
              <span className="text-blue-700 font-black">{pourcentage}%</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}