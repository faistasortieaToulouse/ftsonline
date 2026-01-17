'use client';

import { useEffect, useState } from "react";
import { Briefcase, ExternalLink, CalendarDays, ArrowUpRight } from "lucide-react";

interface TravailSource {
  id: number;
  nom: string;
  description: string;
  type: string;
  url: string;
  tagColor: string;
}

export default function ToulouseTravailPage() {
  const [data, setData] = useState<TravailSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/toulousetravail")
      .then((res) => res.json())
      .then((sorted) => {
        setData(sorted);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Professionnel */}
        <header className="mb-16 border-l-4 border-blue-600 pl-6">
          <div className="flex items-center gap-3 text-blue-600 mb-2 font-bold uppercase tracking-widest text-sm">
            <CalendarDays size={18} />
            <span>Agenda de l'emploi</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
            Travailler à <span className="text-blue-600">Toulouse</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl font-medium italic">
            Centralisation des agendas, salons de recrutement et actualités économiques de la région toulousaine.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-10 w-10 bg-blue-200 rounded-full"></div>
              <p className="text-slate-400 font-bold">Chargement des opportunités...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((item) => (
              <a 
                key={item.id} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-xl hover:border-blue-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Décoration en fond */}
                <Briefcase className="absolute -bottom-4 -right-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" size={120} />

                <div className="relative z-10">
                  <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-4 border ${item.tagColor}`}>
                    {item.type}
                  </span>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                    {item.nom}
                  </h2>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    {item.description}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                    Consulter l'agenda <ArrowUpRight size={14} />
                  </span>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-600" />
                </div>
              </a>
            ))}
          </div>
        )}

        <footer className="mt-20 text-center text-slate-400 text-xs font-medium">
          Mise à jour régulière • Liens vers les plateformes officielles de recrutement.
        </footer>

      </div>
    </div>
  );
}