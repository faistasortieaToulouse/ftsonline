import React from 'react';
import Link from "next/link";
import { ArrowLeft, Facebook, Languages, Globe, ExternalLink, Search } from "lucide-react";

async function getFacebookGroups() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    const res = await fetch(`${baseUrl}/api/facebookgroupes`, { cache: 'no-store' });
    return res.json();
  } catch (e) { return null; }
}

export default async function FacebookGroupsPage() {
  const themes = await getFacebookGroups();

  if (!themes) return <div className="p-10 text-center">Chargement des communautés...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <nav className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#1877f2] hover:underline font-bold transition-all">
          <ArrowLeft size={20} /> Retour à la plateforme
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-4 mb-4">
            <Facebook size={48} className="text-[#1877f2]" /> 
            Communautés de Langues
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl">
            Retrouvez tous les groupes Facebook pour pratiquer une langue, rencontrer des expatriés ou célébrer votre culture à Toulouse.
          </p>
        </header>

        {themes.map((theme: any) => (
          <div key={theme.id} className="mb-12">
            <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2 border-b-2 border-slate-200 pb-2">
              <Globe className="text-slate-400" /> {theme.nom}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {theme.groupes.map((groupe: any, idx: number) => (
                <a 
                  key={idx} 
                  href={groupe.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-5 rounded-2xl shadow-sm border border-white hover:border-[#1877f2] hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-[#1877f2]">
                      <Languages size={24} />
                    </div>
                    <ExternalLink size={18} className="text-slate-300 group-hover:text-[#1877f2]" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 group-hover:text-[#1877f2] transition-colors">{groupe.nom}</h3>
                  <p className="text-xs text-slate-500 italic mb-2">{groupe.tags}</p>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#1877f2] bg-blue-50 inline-block px-2 py-1 rounded">
                    Rejoindre le groupe
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        <footer className="mt-20 p-8 bg-white rounded-3xl text-center border border-slate-200">
          <p className="text-slate-500 text-sm">
            Vous gérez un groupe Facebook à Toulouse qui n'est pas dans la liste ? 
            <br />
            <strong>Contactez l'administrateur pour l'ajouter.</strong>
          </p>
        </footer>
      </div>
    </div>
  );
}
