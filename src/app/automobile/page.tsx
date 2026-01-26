"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Car, ExternalLink, AlertTriangle, FileText } from "lucide-react";

interface AutoLink {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  icon: string;
}

export default function AutomobilePage() {
  const [links, setLinks] = useState<AutoLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/automobile")
      .then((res) => res.json())
      .then((data) => {
        setLinks(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-600">Chargement des infos route...</div>;

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <nav className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-orange-600 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

        {/* Header Style "Automobile" */}
        <header className="bg-slate-800 rounded-2xl p-8 mb-8 text-white shadow-xl flex items-center gap-6 border-b-4 border-orange-500">
          <div className="bg-orange-500 p-4 rounded-full shadow-inner">
            <Car size={36} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Automobile <span className="text-orange-500">&</span> Trafic</h1>
            <p className="text-slate-400 text-sm italic">Circulation, prévisions et conseils de location à Toulouse.</p>
          </div>
        </header>

        {/* Grille de liens */}
        <div className="grid gap-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row"
            >
              <div className="bg-slate-50 p-6 flex items-center justify-center text-4xl md:border-r border-slate-100 group-hover:bg-orange-50 transition-colors">
                {link.icon}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    link.category.includes('Drive') ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {link.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                  {link.title}
                </h2>
                <p className="text-slate-500 text-sm mt-1 italic">{link.description}</p>
              </div>
              <div className="bg-slate-50 p-4 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                <ExternalLink size={20} />
              </div>
            </a>
          ))}
        </div>

        {/* Warning Section */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-600 shrink-0" size={20} />
          <p className="text-xs text-orange-800">
            <b>ZFE Toulouse :</b> N'oubliez pas de vérifier la vignette Crit'Air de votre véhicule avant de circuler à l'intérieur du périmètre du périphérique.
          </p>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-[10px] uppercase tracking-widest">
          Infos Route & Conseils Location - {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
