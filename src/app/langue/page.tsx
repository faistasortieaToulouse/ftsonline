"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Languages, ExternalLink } from "lucide-react";

export default function LanguePage() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("/api/langue").then(res => res.json()).then(setLinks);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-bold transition-all">
            <ArrowLeft size={20} /> Retour à l'accueil
          </Link>
        </nav>

        <header className="bg-cyan-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Languages size={32} /> Communautés : LANGUE
          </h1>
          <p className="text-cyan-100 mt-2">Pratique des langues et ressources FLE à Toulouse.</p>
        </header>

        <div className="grid gap-4">
          {links.map((link: any) => (
            <a key={link.id} href={link.url} target="_blank" className="bg-white p-6 rounded-xl border border-slate-200 hover:border-cyan-400 shadow-sm transition-all flex justify-between items-center group">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">{link.tag}</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">{link.title}</h2>
                <p className="text-slate-500 text-sm">{link.description}</p>
              </div>
              <ExternalLink className="text-slate-300 group-hover:text-cyan-500" size={24} />
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
