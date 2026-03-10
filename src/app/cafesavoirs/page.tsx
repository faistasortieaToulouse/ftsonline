import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Coffee, ExternalLink, GraduationCap, BookOpen, Users, Hammer, Briefcase } from "lucide-react";
import fs from 'fs';
import path from 'path';

async function getCafesData() {
  try {
    const filePath = path.join(process.cwd(), "data", "toulousain", "cafesavoirs.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileContents);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Map des icônes par thématique pour le visuel
const themeIcons: any = {
  "Sciences et Curiosités": <GraduationCap size={20} />,
  "Philosophie et Psychanalyse": <BookOpen size={20} />,
  "Politique et Citoyenneté": <Users size={20} />,
  "Bricolage et Artisanat": <Hammer size={20} />,
  "Business et Vie Professionnelle": <Briefcase size={20} />
};

export default async function CafesSavoirsPage() {
  const data = await getCafesData();

  if (!data) return <div className="p-10 text-center">Données non trouvées.</div>;

  const categories = Object.keys(data.themes);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-10 bg-rose-50/30 min-h-screen font-sans">
      {/* Navigation */}
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-rose-600 transition-all uppercase tracking-widest">
          <ArrowLeft size={16} /> Retour Toulouse
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Coffee className="text-rose-600" size={32} />
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {data.ville}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">
          {data.categorie}
        </h1>
        <p className="text-slate-500 font-medium">Répertoire des lieux de débat, d'échange et de partage de connaissances.</p>
      </header>

      {/* Navigation Rapide (Ancres) */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <a key={cat} href={`#${cat}`} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition-all shadow-sm">
            {cat}
          </a>
        ))}
      </div>

      

      {/* Grille des thèmes */}
      <div className="space-y-12">
        {categories.map((themeName) => (
          <section key={themeName} id={themeName} className="scroll-mt-10">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-rose-100 pb-2">
              <span className="p-2 bg-rose-600 text-white rounded-lg">
                {themeIcons[themeName] || <Coffee size={20} />}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                {themeName}
              </h2>
              <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase">
                {data.themes[themeName].length} adresses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.themes[themeName].map((lieu: any, idx: number) => (
                <a 
                  key={idx} 
                  href={lieu.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex flex-col justify-between"
                >
                  <h3 className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors mb-4 leading-tight">
                    {lieu.nom}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-500 transition-colors">
                    Explorer le site <ExternalLink size={12} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-20 text-center pb-20 pt-10 border-t border-rose-100">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          Agenda collaboratif – Toulouse Métropole 2026
        </p>
        <Link 
          href="/" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all"
        >
          Retour à l'accueil
        </Link>
      </footer>
    </main>
  );
}
