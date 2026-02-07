'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface Terme {
  nom: string;
  definition: string;
}

export default function GlossaireArchitecturePage() {
  const [termes, setTermes] = useState<Terme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/architecture')
      .then((res) => res.json())
      .then((data: Terme[]) => {
        setTermes(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="font-bold text-emerald-800">Chargement du glossaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <nav className="mb-6 max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 mb-2 uppercase">
            Glossaire Architecture
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs md:text-sm font-bold italic">
            Lexique des termes techniques architecturaux
          </p>
        </header>

        <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-emerald-700 text-white">
              <tr>
                <th className="p-4 text-left text-xs md:text-sm font-black uppercase tracking-wider w-full md:w-1/4">
                  Terme / Nom
                </th>
                <th className="p-4 text-left text-xs md:text-sm font-black uppercase tracking-wider hidden md:table-cell">
                  Définition
                </th>
              </tr>
            </thead>
            <tbody>
              {termes.map((item, index) => (
                <TermeRow key={index} item={item} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TermeRow({ item, index }: { item: Terme; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr 
        className={`transition-colors cursor-pointer md:cursor-default border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-emerald-50`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="p-4 font-bold text-emerald-800 align-top">
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg">{item.nom}</span>
            <span className="md:hidden text-emerald-500">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </div>
        </td>
        <td className="p-4 text-gray-700 leading-relaxed hidden md:table-cell">
          {item.definition}
        </td>
      </tr>

      {/* Accordéon pour mobile uniquement */}
      {isOpen && (
        <tr className="md:hidden bg-emerald-50/40">
          <td className="p-4 border-b border-emerald-100">
            <div className="text-gray-700 text-sm leading-loose">
              <strong className="text-emerald-900 block mb-2 text-xs uppercase tracking-widest">Définition :</strong>
              {item.definition}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}