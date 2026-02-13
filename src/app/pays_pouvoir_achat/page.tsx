"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Wallet, Landmark, Info, Coins, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function PouvoirAchatPage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_pouvoir_achat')
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

  // Formateur pour le format monétaire USD
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-16 h-1 bg-slate-100 overflow-hidden rounded-full mb-4">
        <div className="w-full h-full bg-emerald-500 animate-[loading_1.5s_infinite]"></div>
      </div>
      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Calcul des parités monétaires...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="group flex items-center gap-2 text-slate-500 font-semibold mb-10 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
                    <Wallet size={32} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {metadata.title}
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <Coins size={18} />
                  <span className="font-bold uppercase text-[10px] tracking-wider">Concept PPA</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{metadata.definitions.PPA}</p>
              </div>
              <div className="bg-emerald-900 text-emerald-50 p-6 rounded-3xl shadow-xl shadow-emerald-900/10">
                <div className="flex items-center gap-2 text-emerald-300 mb-2">
                  <Landmark size={18} />
                  <span className="font-bold uppercase text-[10px] tracking-wider">Méthodologie</span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">{metadata.definitions.Niveau_de_Pouvoir_d_Achat}</p>
              </div>
            </div>
          </header>
        )}

        <div className="relative mb-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text"
            placeholder="Chercher un pays ou une région..."
            className="w-full pl-16 pr-8 py-5 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-emerald-500/20 shadow-sm text-lg transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.rang} className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl">{item.flag}</span>
                <span className="bg-slate-50 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-100 font-mono">
                  RANG #{item.rang}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
                {item.pays}
              </h3>
              
              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PIB / hab (PPA)</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tight">{formatUSD(item.ppa_usd)}</p>
              </div>

              {/* Jauge comparative basée sur le maximum (Luxembourg) */}
              <div className="mb-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all duration-700 ease-out"
                  style={{ width: `${(item.ppa_usd / 143320) * 100}%` }}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                  {item.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
