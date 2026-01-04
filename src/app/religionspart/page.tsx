'use client';

import { useEffect, useState } from 'react';

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

  if (loading) return <p>Chargement...</p>;
  if (!data) return <p>Erreur lors du chargement des données</p>;

  // Calcul du total mondial
  const total = data.statistiques.reduce((acc, s) => acc + s.nombre, 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{data.titre} ({data.annee_estimation})</h1>
      <p className="mb-4 text-gray-600">Source : {data.source_unite}</p>
      <p className="mb-4 font-semibold">Total mondial : {total.toLocaleString()} individus</p>

      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Religion</th>
            <th className="border px-2 py-1">Nombre d'individus</th>
            <th className="border px-2 py-1">Pourcentage (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.statistiques.map((s, index) => {
            const pourcentage = ((s.nombre / total) * 100).toFixed(2);
            return (
              <tr key={`${s.religion}-${index}`} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{s.religion}</td>
                <td className="border px-2 py-1">{s.nombre.toLocaleString()}</td>
                <td className="border px-2 py-1">{pourcentage}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
