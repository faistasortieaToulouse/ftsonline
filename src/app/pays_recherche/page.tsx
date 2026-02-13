"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Beaker, TrendingUp, Info, Microscope } from 'lucide-react';
import Link from 'next/link';

export default function PaysRecherchePage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_recherche')
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mb-4"></div>
      <p className="text-slate-500 font-medium">Cartographie de l'innovation mondiale...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-blue-700 font-medium mb-8 hover:underline">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                    <Microscope size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">
                {metadata.title}
                </h1>
            </div>
            
            <div className="bg-blue-900 text-blue-50 p-6 rounded-3xl shadow-xl border-b-4 border-blue-700">
              <p className="text-lg opacity-90 leading-relaxed mb-4">{metadata.definition}</p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-blue-800 w-fit px-3 py-1.5 rounded-lg">
                <Info size={14} /> {metadata.methodology}
              </div>
            </div>
          </header>
        )}

        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher une puissance technologique..."
            className="w-full pl-14 pr-6 py-5 rounded-3xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 shadow-lg text-lg transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.rang} className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all group relative overflow-hidden">
              
              <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 px-4 py-1 rounded-bl-2xl font-mono text-xs font-bold">
                #{item.rang}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors">
                {item.pays}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dépenses (Mds $)</p>
                    <p className="text-xl font-black text-blue-600">{item.depenses_mds_usd}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Intensité (% PIB)</p>
                    <p className="text-xl font-black text-blue-700">{item.pourcentage_pib}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Beaker size={18} className="text-amber-500 shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Observation Stratégique</p>
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{item.observation}"
                  </p>
                </div>
              </div>

              {/* Barre de progression visuelle pour l'intensité (basée sur le record d'Israël à ~6.3%) */}
              <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(parseFloat(item.pourcentage_pib) / 6.5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
