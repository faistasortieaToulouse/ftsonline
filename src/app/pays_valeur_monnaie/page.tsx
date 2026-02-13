"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Banknote, Scale, Info, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ValeurMonnaiePage() {
  const [data, setData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_valeur_monnaie')
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

  // Ton formateur spécifique pour les valeurs < 1000
  const formatValue = (val: number) => {
    if (val < 1000) {
      return `${(val / 1000).toFixed(3)} k$`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.3em]">Analyse des marchés...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="group inline-flex items-center gap-2 text-slate-500 font-medium mb-12 hover:text-blue-400 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour aux statistiques
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <Banknote size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Valeur Réelle des Devises
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Comparaison de la puissance financière par habitant. Cette vue met en relief l'écart abyssal entre les économies de services haut de gamme et les économies en transition.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text"
              placeholder="Rechercher une économie..."
              className="w-full bg-slate-900/50 border border-slate-800 pl-14 pr-6 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-white placeholder:text-slate-600"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-900/20">
            <div className="flex items-center gap-3">
                <Globe size={20} className="text-blue-200" />
                <span className="text-sm font-bold uppercase tracking-wider">Total Pays</span>
            </div>
            <span className="text-2xl font-black">{data.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.rang} className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden">
              {/* Fond décoratif subtil */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Banknote size={120} />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl shadow-sm">{item.flag}</span>
                  <span className="text-xs font-mono text-slate-500 tracking-tighter uppercase">ID-RANK: {item.rang}</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>

              <h2 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                {item.pays}
              </h2>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Indice PPA Global</p>
                    <p className={`text-3xl font-black ${item.ppa_usd < 2000 ? 'text-amber-500' : 'text-white'}`}>
                      {formatValue(item.ppa_usd)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Potentiel</p>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-800 rounded-md text-slate-300">
                        {((item.ppa_usd / 143320) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${item.ppa_usd < 2000 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.max((item.ppa_usd / 143320) * 100, 2)}%` }}
                  />
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex gap-3">
                   <Zap size={14} className="text-blue-500 shrink-0" />
                   <p className="text-xs text-slate-400 leading-relaxed">
                     {item.note}
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 font-medium text-lg">Aucune donnée correspondante à cette région.</p>
          </div>
        )}
      </div>
    </div>
  );
}
