"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Beaker, Info, Microscope } from 'lucide-react';
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
        // Sécurité : on s'assure que data est bien un tableau
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
      <p className="text-slate-500 font-medium font-sans">Chargement des données R&D...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-blue-700 font-semibold mb-8 hover:underline decoration-2">
          <ArrowLeft size={18} /> Retour au Dashboard
        </Link>

        {metadata && (
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-200">
                    <Microscope size={32} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  {metadata.title}
                </h1>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-blue-50 p-8 rounded-[2rem] shadow-2xl border-b-8 border-blue-700/50">
              <p className="text-lg md:text-xl opacity-90 leading-relaxed mb-6 font-medium">
                {metadata.definition}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-800/50 border border-blue-400/30 w-fit px-4 py-2 rounded-full">
                <Info size={14} className="text-blue-300" /> {metadata.methodology}
              </div>
            </div>
          </header>
        )}

        {/* Barre de Recherche */}
        <div className="relative mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            type="text"
            placeholder="Rechercher une puissance technologique (ex: Israël, Japon...)"
            className="w-full pl-16 pr-8 py-6 rounded-[2rem] border-none ring-1 ring-slate-200 focus:ring-4 focus:ring-blue-500/20 shadow-xl text-xl transition-all placeholder:text-slate-400 bg-white/80 backdrop-blur-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Grille de résultats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => {
            // Extraction propre du nombre pour la barre de progression
            const intensiteNum = parseFloat(item.pourcentage_pib.replace('%', '').replace(',', '.'));
            
            return (
              <div key={item.rang} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                
                <div className="absolute top-0 right-0 bg-slate-50 text-slate-400 px-6 py-2 rounded-bl-[2rem] font-mono text-xs font-bold border-l border-b border-slate-100">
                  #{item.rang}
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-6 group-hover:text-blue-600 transition-colors">
                  {item.pays}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Dépenses (Mds $)</p>
                      <p className="text-2xl font-black text-slate-900">{item.depenses_mds_usd}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 group-hover:bg-blue-50 transition-colors">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-widest">Intensité (% PIB)</p>
                      <p className="text-2xl font-black text-blue-700">{item.pourcentage_pib}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start mb-8 bg-amber-50/30 p-4 rounded-2xl">
                  <Beaker size={20} className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-widest mb-1">Analyse</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {item.observation}
                    </p>
                  </div>
                </div>

                {/* Barre de progression basée sur le record mondial (Israël ~6.3%) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Effort R&D</span>
                    <span>{item.pourcentage_pib}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]" 
                        style={{ width: `${Math.min((intensiteNum / 6.5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
