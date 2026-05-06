"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SystemePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/systeme")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="p-10 text-red-500">Erreur : Fichier JSON introuvable dans data/technologie/systeme.json</div>;
  if (!data) return <div className="p-10 text-center font-mono">Initialisation du système...</div>;

  // Composant interne pour les listes chronologiques
  const TimelineSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-blue-100 pb-2 italic">
        {title}
      </h2>
      <div className="space-y-6 border-l-2 border-slate-200 ml-4 pl-6">
        {items.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[33px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {item.year}
              </span>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Barre de navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-all">
            <span className="mr-2">🏠</span> Retour à l'Accueil
          </Link>
          <span className="text-slate-400 text-sm hidden sm:block">Technologie / OS</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {data.titre}
          </h1>
          <div className="inline-block px-4 py-1 bg-slate-900 text-white rounded-full text-sm font-medium">
            {data.categorie_principale} • {data.categorie_secondaire}
          </div>
        </header>

        {/* Section Wikipedia */}
        <section className="mb-16 bg-blue-50/50 p-8 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
             📚 Ressources de référence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.liens_wikipedia.map((link: any, i: number) => (
              <a 
                key={i} 
                href={link.link} 
                target="_blank" 
                className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-blue-600 group-hover:underline">{link.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{link.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Contenu Chronologique */}
        
        <TimelineSection title="01. Origines et Fondations" items={data.origines_et_fondations} />
        
        <TimelineSection 
          title={`02. ${data.emergence_et_adoption_linux.title}`} 
          items={data.emergence_et_adoption_linux.items} 
        />
        
        <TimelineSection 
          title={`03. ${data.naissance_ecosysteme_linux.title}`} 
          items={data.naissance_ecosysteme_linux.items} 
        />

        <TimelineSection 
          title={`04. ${data.democratisation_des_distributions.title}`} 
          items={data.democratisation_des_distributions.items} 
        />

        <TimelineSection 
          title={`05. ${data.linux_dans_l_infrastructure_moderne.title}`} 
          items={data.linux_dans_l_infrastructure_moderne.items} 
        />

        {/* Conclusion / Synthèse */}
        <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl mt-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-slate-700 pb-4">
            {data.linux_aujourdhui_et_synthese.title}
          </h2>
          <div className="space-y-6">
            {data.linux_aujourdhui_et_synthese.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-blue-400 font-mono text-sm pt-1">[{item.year}]</span>
                <div>
                  <h4 className="font-bold text-slate-100">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
