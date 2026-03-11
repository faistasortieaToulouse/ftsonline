"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Empire {
  Empire: string;
  Dates: string;
  Zone: string;
}

export default function EmpirePage() {
  const [empires, setEmpires] = useState<Empire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmpires = async () => {
      try {
        const response = await fetch('/api/empire');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const data = await response.json();
        setEmpires(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpires();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header avec lien de retour */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chronologie des Empires</h1>
            <p className="text-gray-600 mt-2">Liste historique basée sur les données d'archives</p>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm"
          >
            ← Retour à l'Accueil
          </Link>
        </div>

        {/* Gestion des états : Chargement / Erreur / Tableau */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">Erreur : {error}</p>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-4 uppercase text-xs font-semibold tracking-wider">Empire</th>
                    <th className="p-4 uppercase text-xs font-semibold tracking-wider">Dates d'existence</th>
                    <th className="p-4 uppercase text-xs font-semibold tracking-wider">Zone géographique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {empires.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{item.Empire}</td>
                      <td className="p-4 text-gray-700 whitespace-nowrap">{item.Dates}</td>
                      <td className="p-4 text-gray-600 italic">{item.Zone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-4 border-t text-right text-sm text-gray-500">
              Total : {empires.length} empires répertoriés
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
