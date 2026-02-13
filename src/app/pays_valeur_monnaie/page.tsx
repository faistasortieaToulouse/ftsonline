"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Coins, Info, Globe, BadgeDollarSign, TrendingUp, Landmark } from 'lucide-react';
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
    item.pays.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.monnaie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour déterminer si la monnaie est "plus forte" que 1 USD
  const isStrongerThanUSD = (valStr: string) => {
    // Si la chaîne contient "/ 1$", c'est qu'il faut plusieurs unités pour 1 dollar (donc plus faible)
    if (valStr.includes('/ 1$')) return false;
    // On extrait le nombre (ex: "~3,25 $" -> 3.25)
    const numericValue = parseFloat(valStr.replace('~', '').replace('$', '').replace(',', '.').trim());
    return numericValue > 1.0;
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-1 bg-slate-100 overflow-hidden rounded-full mb-4">
        <div className="w-full h-full bg-indigo-600 animate-[loading_1.5s_infinite]"></div>
      </div>
      <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.3em]">Synchronisation des devises...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="group inline-flex items-center gap-2 text-slate-500 font-bold mb-10 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl shadow-indigo-200">
                <Landmark size={32} />
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                {metadata.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(metadata.definitions).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key.replace(/_/g, ' ')}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{value}</p>
                </div>
              ))}
            </div>
          </header>
        )}

        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text"
            placeholder="Rechercher un pays ou une devise (ex: Dinar, Livre, Yen...)"
            className="w-full pl-16 pr-8 py-6 rounded-[2rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-indigo-500/10 shadow-xl shadow-slate-200/50 text-lg transition-all outline-none bg-white"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => {
            const stronger = isStrongerThanUSD(item.valeur_usd);
            
            return (
              <div key={item.rang} className="bg-white rounded-[3rem] border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-6xl drop-shadow-md">{item.flag}</span>
                    <span className="text-[10px] font-black text-white bg-slate-900 px-3 py-1 rounded-full w-fit tracking-tighter">
                      RANK #{item.rang}
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl ${stronger ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
                    {item.pays}
                  </h3>
                  <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">
                    {item.monnaie}
                  </p>
                </div>

                <div className={`rounded-[2rem] p-6 mb-6 transition-all duration-300 ${stronger ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 border border-slate-100'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${stronger ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Valeur vs Dollar (USD)
                  </p>
                  <p className={`text-4xl font-black tracking-tighter ${stronger ? 'text-white' : 'text-slate-900'}`}>
                    {item.valeur_usd}
                  </p>
                </div>

                <div className="flex gap-4 bg-slate-50/50 p-4 rounded-2xl">
                  <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed font-bold italic">
                    {item.note}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Coins size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black text-xl">Aucune devise trouvée pour votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
