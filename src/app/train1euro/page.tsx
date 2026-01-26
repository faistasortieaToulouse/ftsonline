"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Train, ExternalLink, Info } from "lucide-react";

interface TrainLink {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
}

export default function Train1EuroPage() {
  const [links, setLinks] = useState<TrainLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/train1euro")
      .then((res) => res.json())
      .then((data) => {
        setLinks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center font-bold">Chargement des bons plans rail...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Retour à l'accueil
          </Link>
        </nav>

        {/* Header */}
        <header className="bg-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <Train size={32} /> Trains à 1€ en Occitanie
            </h1>
            <p className="text-emerald-100 italic">Voyagez malin à travers la région à prix mini.</p>
          </div>
          <div className="hidden md:block bg-white/20 p-4 rounded-full">
            <span className="text-3xl font-bold">1€</span>
          </div>
        </header>

        {/* Alerte Info */}
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 items-start">
          <Info className="text-blue-500 shrink-0" size={20} />
          <p className="text-sm text-blue-800">
            <b>Conseil :</b> Les billets à 1€ sont limités. Réservez-les dès l'ouverture des ventes (souvent 3 à 5 semaines à l'avance) ou profitez des premiers week-ends du mois.
          </p>
        </div>

        {/* Grille de liens */}
        <div className="grid gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    {link.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                    {link.title}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm">{link.description}</p>
              </div>
              <ExternalLink className="text-slate-300 group-hover:text-emerald-500 transition-colors ml-4" size={24} />
            </a>
          ))}
        </div>

        <footer className="mt-12 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} - Informations basées sur les tarifs lio Occitanie.
        </footer>
      </div>
    </main>
  );
}
