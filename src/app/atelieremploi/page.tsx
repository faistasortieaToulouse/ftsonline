"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, ExternalLink, FileCheck, GraduationCap } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  type: string;
}

export default function AtelierEmploiPage() {
  const [data, setData] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/atelieremploi")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Ouverture du dossier...</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] p-4 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

        {/* Header Professionnel */}
        <header className="bg-[#0f172a] rounded-2xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-amber-400 p-3 rounded-lg text-slate-900">
                <Briefcase size={28} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Atelier <span className="text-amber-400">Emploi</span></h1>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Boîte à outils complète pour accompagner votre insertion professionnelle et perfectionner vos outils de candidature.
            </p>
          </div>
          <GraduationCap className="absolute -right-8 -bottom-8 text-white/5 w-48 h-48 -rotate-12" />
        </header>

        {/* Liste des Ressources */}
        <div className="space-y-6">
          {data.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all p-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6"
              >
                <div className="flex items-center gap-5">
                  <div className="bg-slate-100 p-4 rounded-xl text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <FileCheck size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-100 text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-900 group-hover:border-amber-400 transition-all">
                    <ExternalLink size={20} />
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Zone d'encouragement */}
        <footer className="mt-16 bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <p className="text-slate-600 text-sm italic">
            "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès. Si vous aimez ce que vous faites, vous réussirez."
          </p>
        </footer>
      </div>
    </main>
  );
}
