'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type MotGrec = {
  id: number;
  mot: string;
  signification: string;
};

export default function GrecMedicalPage() {
  const [mots, setMots] = useState<MotGrec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/grecmedical')
      .then(res => res.json())
      .then(data => {
        setMots(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement du dictionnaire...</p>;
  if (!mots.length) return <p>Aucun mot trouvé</p>;

  return (
    <div className="p-4">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-2xl font-bold mb-4">Dictionnaire Grec Médical</h1>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-blue-100">
          <tr>
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Mot</th>
            <th className="border px-3 py-2 text-left">Signification</th>
          </tr>
        </thead>
        <tbody>
          {mots.map(m => (
            <tr key={m.id} className="hover:bg-blue-50">
              <td className="border px-3 py-1">{m.id}</td>
              <td className="border px-3 py-1 font-semibold">{m.mot}</td>
              <td className="border px-3 py-1">{m.signification}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
