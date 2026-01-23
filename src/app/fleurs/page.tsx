'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Fleur = {
  id: number;
  nom: string;
  couleur: string;
};

export default function FleursPage() {
  const [fleurs, setFleurs] = useState<Fleur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fleurs')
      .then(res => res.json())
      .then(data => {
        setFleurs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des fleurs...</p>;
  if (!fleurs.length) return <p>Aucune fleur trouvée</p>;

  return (
    <div className="p-4">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-2xl font-bold mb-4">Liste des fleurs</h1>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-green-100">
          <tr>
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Nom</th>
            <th className="border px-3 py-2 text-left">Couleur</th>
          </tr>
        </thead>
        <tbody>
          {fleurs.map(fleur => (
            <tr key={fleur.id} className="hover:bg-green-50">
              <td className="border px-3 py-1">{fleur.id}</td>
              <td className="border px-3 py-1">{fleur.nom}</td>
              <td className="border px-3 py-1">
                <span
                  className="inline-block w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: fleur.couleur.toLowerCase() }}
                ></span>
                {fleur.couleur}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
