"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, factory, Wind, Droplets, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function PaysPollutionPage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_pollution')
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-500 font-medium">Analyse des données environnementales...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 font-medium mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour
        </Link>

        {metadata && (
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 mb-4">{metadata.title}</h1>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <p className="text-slate-600 leading-relaxed italic">{metadata.definition}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-500">Méthodologie : {metadata.methodology}</p>
            </div>
          </header>
        )}

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Rechercher un pays..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.rang} className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">#{item.rang}</span>
                {item.score_pollution && (
                  <span className="text-sm font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                    Score: {item.score_pollution}/100
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
                {item.pays}
              </h3>

              <div className="space-y-3">
                {/* Affichage dynamique selon les clés présentes dans le JSON */}
                {(item.problematique || item.cause || item.cause_principale) && (
                  <div className="flex gap-3">
                    <Wind size={16} className="text-slate-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Cause / Problématique</p>
                      <p className="text-sm text-slate-700">{item.problematique || item.cause || item.cause_principale}</p>
                    </div>
                  </div>
                )}

                {(item.impact || item.observation || item.tendance) && (
                  <div className="flex gap-3">
                    <Droplets size={16} className="text-blue-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Impact / Tendance</p>
                      <p className="text-sm text-slate-700">{item.impact || item.observation || item.tendance}</p>
                    </div>
                  </div>
                )}

                {(item.reussite || item.atout) && (
                  <div className="flex gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <Leaf size={16} className="text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">Point Fort</p>
                      <p className="text-sm text-emerald-800 font-medium">{item.reussite || item.atout}</p>
                      {item.etat && <p className="text-xs text-emerald-700 mt-1">{item.etat}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
