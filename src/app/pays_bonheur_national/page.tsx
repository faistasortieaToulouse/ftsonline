"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Heart, Info, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface HappinessData {
  rang: number;
  pays: string;
  score: number;
  analyse: string;
}

interface PageContent {
  metadata: { title: string; definition: string; methodology_note: string };
  data: HappinessData[];
}

export default function BonheurNationalPage() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_bonheur_national')
      .then(res => res.json())
      .then(json => {
        setContent(json);
        setLoading(false);
      });
  }, []);

  const filteredData = content?.data.filter(item =>
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-rose-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 mb-6 font-medium">
          <ArrowLeft size={20} /> Retour
        </Link>

        {/* SECTION D'EN-TÊTE & DÉFINITION */}
        <div className="bg-white rounded-3xl shadow-sm border border-rose-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                <Heart className="text-rose-500 fill-rose-500" />
                {content?.metadata.title || "Chargement..."}
              </h1>
              <div className="mt-4 flex gap-3 p-4 bg-rose-50 rounded-2xl text-rose-900 text-sm">
                <Info className="shrink-0" size={18} />
                <p>{content?.metadata.definition}</p>
              </div>
            </div>

            <div className="relative self-end">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Chercher un pays..."
                className="pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none w-full md:w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* LISTE DES RÉSULTATS */}
        <div className="grid gap-4">
          {loading ? (
             <div className="text-center py-20 text-rose-300 animate-pulse font-bold">Calcul du bonheur en cours...</div>
          ) : filteredData.map((item) => (
            <div 
              key={`${item.rang}-${item.pays}`}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4 group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`text-2xl font-black w-12 h-12 rounded-xl flex items-center justify-center 
                  ${item.rang <= 3 ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-400'}`}>
                  {item.rang}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                    {item.pays}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed italic">
                    "{item.analyse}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:border-l md:pl-6 border-slate-100">
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Score</div>
                  <div className="text-2xl font-black text-slate-800">{item.score.toFixed(2)}</div>
                </div>
                {/* Barre de progression visuelle */}
                <div className="w-16 h-16 relative">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-rose-500" strokeWidth="3" strokeDasharray={`${(item.score / 8) * 100}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp size={14} className="text-rose-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-slate-400 text-xs italic">
          Note méthodologique : {content?.metadata.methodology_note}
        </p>
      </div>
    </div>
  );
}
