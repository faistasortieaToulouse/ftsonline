'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Terme {
  nom: string;
  definition: string;
}

export default function GlossaireArchitecturePage() {
  const [termes, setTermes] = useState<Terme[]>([]);

  useEffect(() => {
    fetch('/api/architecture')
      .then((res) => res.json())
      .then((data: Terme[]) => setTermes(data));
  }, []);

  if (!termes || termes.length === 0) {
    return <div className="p-10 text-center font-bold">Chargement du glossaire...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-2 uppercase">
            Glossaire Architecture
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-sm font-bold italic">
            Lexique des termes techniques architecturaux
          </p>
        </header>

        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-emerald-700 text-white sticky top-0">
              <tr>
                <th className="p-4 border-b border-gray-300 text-left text-sm font-black uppercase tracking-wider w-1/4">
                  Terme / Nom
                </th>
                <th className="p-4 border-b border-gray-300 text-left text-sm font-black uppercase tracking-wider">
                  Définition
                </th>
              </tr>
            </thead>
            <tbody>
              {termes.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-emerald-50 transition-colors even:bg-gray-50"
                >
                  <td className="p-4 border-b border-gray-200 font-bold text-emerald-800 align-top">
                    {item.nom}
                  </td>
                  <td className="p-4 border-b border-gray-200 text-gray-700 leading-relaxed">
                    {item.definition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
