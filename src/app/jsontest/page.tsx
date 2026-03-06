'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function JsonTestPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/jsontest")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mb-4"></div>
      <p className="text-gray-600 font-medium">Chargement de l'histoire atomique...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-10 font-sans leading-relaxed">
      
      {/* Navigation Retour */}
      <nav className="mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-red-800 hover:text-red-600 font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-red-900 mb-6 tracking-tight">
          {data.titre}
        </h1>
        <p className="text-xl italic text-gray-700 border-l-4 border-red-600 pl-6 py-2 bg-red-50/50">
          {data.introduction}
        </p>
      </header>

      <section className="mb-10 bg-white shadow-sm border border-gray-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <span className="text-red-600">🔬</span> Chronologie Scientifique
        </h2>
        <div className="space-y-3">
          {data.chronologie_scientifique.map((item: string, i: number) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-mono text-red-700 font-bold">0{i+1}</span>
              <span className="text-gray-800 text-sm sm:text-base">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-orange-800">
          <span className="text-orange-600">⚠️</span> L'échec nazi (Uranprojekt)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.echec_nazi_uranprojekt.map((item: string, i: number) => {
            const [label, content] = item.split(': ');
            return (
              <div key={i} className="p-4 border-l-2 border-orange-400 bg-orange-50/30">
                <span className="block font-bold text-orange-900 text-xs uppercase mb-1">{label}</span>
                <span className="text-gray-700 text-sm">{content}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="bg-zinc-900 text-yellow-500 p-8 rounded-2xl mb-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-6xl font-black italic">!</span>
        </div>
        <h3 className="text-sm font-black mb-2 uppercase tracking-[0.2em] text-yellow-600">Le Saviez-vous ?</h3>
        <p className="text-xl font-medium leading-snug">{data.conclusion_anecdotique}</p>
      </div>

      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-200">
        {Object.entries(data.notes_finales).map(([key, value]: [string, any], i) => (
          <div key={i} className="group">
            <h4 className="font-bold text-red-700 text-xs uppercase mb-2 tracking-wider group-hover:text-red-500 transition-colors">
              {key.replace(/_/g, ' ')}
            </h4>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              "{value}"
            </p>
          </div>
        ))}
      </footer>
    </div>
  );
}
