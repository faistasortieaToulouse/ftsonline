"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, Search, Info } from 'lucide-react';
import Link from 'next/link';

interface IDHData {
  rang: number;
  pays: string;
  idh: number;
  evolution: "en augmentation" | "en diminution" | "en stagnation";
}

export default function IDHPage() {
  const [data, setData] = useState<IDHData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_niveau_developpement')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (idh: number) => {
    if (idh >= 0.800) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (idh >= 0.550) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getEvolutionIcon = (evo: string) => {
    switch (evo) {
      case "en augmentation": return <TrendingUp className="text-emerald-500" size={18} />;
      case "en diminution": return <TrendingDown className="text-rose-500" size={18} />;
      default: return <Minus className="text-slate-400" size={18} />;
    }
  };

  const filtered = data.filter(p => p.pays.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'Accueil
        </Link>

        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            Indice de Développement Humain <span className="text-blue-600">(IDH)</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Classement mondial basé sur la santé, l'éducation et le niveau de vie. 
            L'IDH varie de 0 (faible) à 1 (très élevé).
          </p>
        </header>

        <div className="sticky top-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Rechercher une nation..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 bg-slate-100"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-400" /> Très Élevé</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400" /> Moyen/Élevé</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-400" /> Faible</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.rang} className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-lg border text-sm font-bold ${getStatusColor(item.idh)}`}>
                    {item.idh.toFixed(3)}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-sm">
                    <Trophy size={14} className={item.rang <= 3 ? "text-yellow-500" : ""} />
                    #{item.rang}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-4">
                  {item.pays}
                </h2>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs text-slate-400 uppercase font-black tracking-widest">Évolution</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    {getEvolutionIcon(item.evolution)}
                    {item.evolution}
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
