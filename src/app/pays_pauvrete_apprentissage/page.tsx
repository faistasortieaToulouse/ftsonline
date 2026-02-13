"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, BookOpen, GraduationCap, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface Metadata {
  title: string;
  definition: string;
  methodology_notes: string[];
}

interface LearningData {
  rang: number;
  pays: string;
  taux_lp: string;
  analyse: string;
  particularite: string;
}

export default function PauvretéApprentissagePage() {
  const [data, setData] = useState<LearningData[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_pauvrete_apprentissage')
      .then(res => res.json())
      .then(json => {
        setData(json.data || []);
        setMetadata(json.metadata || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = data.filter(item => 
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse text-lg">
          Analyse des systèmes éducatifs mondiaux...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="flex items-center gap-2 text-emerald-700 font-medium mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>

        {/* Header Section */}
        {metadata && (
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-slate-900">
              {metadata.title}
            </h1>
            
            <div className="bg-emerald-700 text-white p-6 rounded-3xl shadow-xl mb-8">
              <div className="flex gap-4 items-start">
                <BookOpen className="shrink-0 mt-1" size={28} />
                <div>
                  <h2 className="text-xl font-bold mb-2">Comprendre l'indicateur</h2>
                  <p className="text-emerald-50 opacity-95 leading-relaxed">{metadata.definition}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metadata.methodology_notes.map((note, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 text-sm text-slate-600 shadow-sm flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  {note}
                </div>
              ))}
            </div>
          </header>
        )}

        {/* Search Bar */}
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher un pays ou un territoire..."
            className="w-full pl-14 pr-6 py-5 rounded-3xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 shadow-lg transition-all text-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Results Grid */}
        {filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">Aucune donnée pour "{searchTerm}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              <div key={item.rang} className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-2xl transition-all group relative overflow-hidden">
                
                {/* Badge Rang */}
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 px-4 py-1 rounded-bl-2xl font-mono text-xs font-bold">
                  #{item.rang}
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                    {item.pays}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-sm font-black">
                    Taux LP : {item.taux_lp}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <GraduationCap size={18} className="text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Axe Analyse</p>
                      <p className="text-sm text-slate-700 font-semibold">{item.analyse}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-slate-50 p-4 rounded-2xl">
                    <Lightbulb size={18} className="text-amber-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Particularité</p>
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        {item.particularite}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
