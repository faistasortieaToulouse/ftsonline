"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Banknote, Info, Zap, Globe, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initialisation des flux...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="group inline-flex items-center gap-2 text-slate-500 font-semibold mb-10 hover:text-blue-600 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'Accueil
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Banknote size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              Valeur Réelle des Devises
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl text-lg leading-relaxed font-medium">
            Analyse comparative de la puissance d'achat. Ce module convertit la richesse théorique en capacité de consommation locale réelle.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Rechercher une économie ou un pays..."
              className="w-full bg-white border border-slate-200 pl-14 pr-6 py-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Globe size={20} />
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Couverture</span>
            </div>
            <span className="text-2xl font-black text-blue-600">{data.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <div key={item.rang} className="bg-white border border-slate-200 rounded-[2rem] p-7 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group relative">
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-4xl drop-shadow-sm">{item.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Classement</span>
                    <span className="text-sm font-black text-slate-700 font-mono">#{item.rang}</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <TrendingUp size={16} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                {item.pays}
              </h2>

              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Indice PPA Global</p>
                    <p className={`text-3xl font-black tracking-tighter ${item.ppa_usd < 2000 ? 'text-orange-500' : 'text-slate-900'}`}>
                      {formatValue(item.ppa_usd)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ratio Max</p>
                    <span className="text-xs font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-600">
                        {((item.ppa_usd / 143320) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${item.ppa_usd < 2000 ? 'bg-orange-400' : 'bg-blue-600'}`}
                    style={{ width: `${Math.max((item.ppa_usd / 143320) * 100, 2)}%` }}
                  />
                </div>

                <div className="pt-5 border-t border-slate-100 flex gap-3">
                   <div className={`shrink-0 mt-0.5 ${item.ppa_usd < 2000 ? 'text-orange-400' : 'text-blue-500'}`}>
                     <Zap size={16} />
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                     {item.note}
                   </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-semibold text-lg">Aucun résultat pour cette recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
