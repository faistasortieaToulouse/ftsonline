"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Settings, Tractor, Info, Sprout } from 'lucide-react';
import Link from 'next/link';

interface AgreMecaData {
  rang: number;
  pays: string;
  tracteurs_1000ha: string;
  profil: string;
}

interface PageContent {
  metadata: { title: string; definition: string };
  data: AgreMecaData[];
}

export default function MecaniqueAgricolePage() {
  const [content, setContent] = useState<PageContent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pays_mecanique_agricole')
      .then(res => res.json())
      .then(json => {
        setContent(json);
        setLoading(false);
      });
  }, []);

  const filteredData = content?.data.filter(item =>
    item.pays.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 text-stone-900">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        {/* HEADER & METADATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="space-y-3 flex-1">
              <h1 className="text-3xl font-black tracking-tight text-stone-800 flex items-center gap-3">
                <Tractor className="text-emerald-600" size={32} />
                {content?.metadata.title || "Chargement..."}
              </h1>
              <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 text-sm leading-relaxed">
                <Info className="shrink-0 text-emerald-600" size={20} />
                <p>{content?.metadata.definition}</p>
              </div>
            </div>

            <div className="relative self-end w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text"
                placeholder="Rechercher une nation..."
                className="pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* LISTE DES PAYS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <Settings className="animate-spin mx-auto text-emerald-200 mb-4" size={48} />
              <p className="text-stone-400 font-medium">Analyse des parcs machines...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div 
                key={`${item.rang}-${item.pays}`}
                className="bg-white rounded-xl border border-stone-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Accent visuel pour le top 10 */}
                {item.rang <= 10 && (
                  <div className="absolute top-0 right-0 p-1">
                    <Sprout className="text-emerald-100 group-hover:text-emerald-500 transition-colors" size={40} />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Rang</span>
                    <span className={`text-2xl font-black ${item.rang <= 10 ? 'text-emerald-600' : 'text-stone-300'}`}>
                      {item.rang}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <h2 className="text-lg font-bold text-stone-800">{item.pays}</h2>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-700">{item.tracteurs_1000ha}</span>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Tracteurs / 1k Ha</p>
                      </div>
                    </div>
                    
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <p className="text-sm text-stone-600 leading-snug">
                        <span className="font-bold text-stone-400 text-[10px] uppercase block mb-1">Profil Agrotechnique</span>
                        {item.profil}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 rounded-2xl text-center border-2 border-dashed border-stone-200">
              <p className="text-stone-400 italic">Aucune donnée pour "{searchTerm}"</p>
            </div>
          )}
        </div>

        <footer className="mt-12 mb-8 text-center text-stone-400 text-xs">
          <p>© 2026 - Observatoire Mondial de la Mécanisation Agricole</p>
          <p className="mt-1 italic">Note : Les densités très faibles (ex: USA/Canada) reflètent souvent des machines de taille gigantesque plutôt qu'un manque d'équipement.</p>
        </footer>
      </div>
    </div>
  );
}
