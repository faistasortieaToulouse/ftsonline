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

      {/* 1. Le rendez-vous manqué V2 / Atome */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-800">
          <span className="text-zinc-600">🚀</span> Le rendez-vous manqué (V2 & Atome)
        </h2>
        <div className="space-y-4">
          {data.le_rendez_vous_manque_v2_atome?.map((item: string, i: number) => {
            const [label, content] = item.split(': ');
            return (
              <div key={i} className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="font-bold text-zinc-900">{label} :</span>{" "}
                <span className="text-gray-700">{content}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Désintérêt stratégique de Hitler */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-800">
          <span className="text-red-600">📉</span> Désintérêt Stratégique
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.desinteret_strategique_de_hitler?.map((item: string, i: number) => {
            const [label, content] = item.split(': ');
            return (
              <div key={i} className="p-4 border-t-2 border-red-800 bg-white shadow-sm">
                <span className="block font-bold text-red-900 text-xs uppercase mb-1">{label}</span>
                <span className="text-gray-700 text-sm">{content}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Projet Manhattan USA */}
      <section className="mb-10 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-900">
          <span className="text-blue-700">🇺🇸</span> Projet Manhattan (USA)
        </h2>
        <div className="space-y-3">
          {data.projet_manhattan_usa?.map((item: string, i: number) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <p className="text-gray-800 text-sm sm:text-base">{item}</p>
            </div>
          ))}
        </div>
      </section>

{/* 4. Operation Epsilon */}
      <section className="mb-10 p-6 bg-zinc-100 rounded-lg border-l-4 border-zinc-800">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">🕵️ Opération Epsilon (Farm Hall)</h2>
        <div className="space-y-3">
          {data.operation_epsilon_farm_hall && data.operation_epsilon_farm_hall.map((item: string, i: number) => (
            <p key={i} className="text-sm italic text-zinc-700">"{item}"</p>
          ))}
        </div>
      </section>

      {/* 5. Dénouement 1945 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-red-700">
          <span className="text-red-600">💥</span> Dénouement 1945
        </h2>
        <div className="space-y-4">
          {data.denouement_1945 && data.denouement_1945.map((item: string, i: number) => (
            <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-lg font-medium text-red-900 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Synthèse Stratégique */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.synthese_strategique && data.synthese_strategique.map((item: string, i: number) => {
          // Sécurisation au cas où il n'y aurait pas de ":"
          const [pays, ...rest] = item.split(': ');
          const texte = rest.join(': '); 
          return (
            <div key={i} className="p-5 border rounded-xl shadow-sm bg-white hover:border-red-300 transition-colors">
              <h3 className="font-black text-lg mb-2 underline decoration-red-500 text-gray-800">{pays}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{texte}</p>
            </div>
          );
        })}
      </section>

      {/* 7. Le Cas Particulier de la France */}
      <section className="mb-10 p-8 bg-blue-900 text-white rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
          <span className="text-4xl">🇫🇷</span> Le Cas de la France
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {data.le_cas_particulier_de_la_france && data.le_cas_particulier_de_la_france.map((item: string, i: number) => (
            <div key={i} className="flex gap-4 items-start border-b border-blue-800 pb-4 last:border-0">
              {/* On enlève la logique de calcul de date car elle ne correspondait pas aux vraies dates du texte */}
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
              <p className="text-blue-50 text-sm sm:text-base leading-relaxed">{item}</p>
            </div>
          ))}
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
