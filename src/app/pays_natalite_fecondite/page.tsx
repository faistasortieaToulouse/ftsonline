"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Baby, TrendingDown, TrendingUp, Search, Globe, Activity } from 'lucide-react';
import Link from 'next/link';

interface NataliteData {
  id: number;
  pays: string;
  fecondite_cia_2016: number;
  fecondite_onu_2010_2015: number;
  natalite_cia_2016: number;
  natalite_cia_2025: number | null;
  natalite_onu_2010_2015: number;
  natalite_ined_2023?: number;
}

export default function NatalitePage() {
  const [countries, setCountries] = useState<NataliteData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_natalite_fecondite')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        setLoading(false);
      });
  }, []);

  const filtered = countries.filter(c => 
    c.pays.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
              <Baby className="text-pink-500" size={40} />
              Natalité & Fécondité
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Analyse comparative des taux de fécondité (enfants/femme) et de natalité (naissances/1000 hab.) à travers les bases de données de la CIA, de l'ONU et de l'INED.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un pays..."
              className="pl-10 pr-4 py-3 border border-slate-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 italic text-slate-400">Calcul des données démographiques...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                  <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                    <span className="text-sm font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-500">#{item.id}</span>
                    {item.pays}
                  </h3>
                  <Globe className="text-slate-300" size={20} />
                </div>

                <div className="grid grid-cols-2 gap-4 p-5">
                  {/* Section Fécondité */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 flex items-center gap-1">
                      <Activity size={12} /> Fécondité (CIA/ONU)
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800">{item.fecondite_cia_2016}</span>
                      <span className="text-xs text-slate-400 italic">enf/femme</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <p>CIA 2016: <b>{item.fecondite_cia_2016}</b></p>
                      <p>ONU 2015: <b>{item.fecondite_onu_2010_2015}</b></p>
                    </div>
                  </div>

                  {/* Section Natalité */}
                  <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-1">
                      <TrendingUp size={12} /> Natalité (1k Hab.)
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-700">
                        {item.natalite_ined_2023 ?? item.natalite_cia_2016}
                      </span>
                    </div>
                    
                    {/* Indicateur de tendance 2025 */}
                    {item.natalite_cia_2025 && (
                      <div className={`text-[10px] font-bold flex items-center gap-1 ${item.natalite_cia_2025 < item.natalite_cia_2016 ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {item.natalite_cia_2025 < item.natalite_cia_2016 ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}
                        Proj. 2025: {item.natalite_cia_2025}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer de la carte avec comparatif INED si dispo */}
                {item.natalite_ined_2023 && (
                  <div className="px-5 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between">
                    <span>Donnée INED 2023 disponible</span>
                    <span>Taux: {item.natalite_ined_2023}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
