'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Sun, Info, 
  Cloud, CloudSun, CloudRain, CloudLightning, Thermometer, Snowflake, Mountain
} from "lucide-react";

// Normales Climatiques pour les Pyrénées
const NORMALES_CLIMAT = {
  luchon: { 
    pluie: 950, soleil: 1850, 
    moyAn: "11,2°C", froid: "3,1°C", chaud: "21,5°C",
    neigeAn: 180, joursGel: 90
  },
  saintlary: { 
    pluie: 1100, soleil: 1900, 
    moyAn: "10,5°C", froid: "2,2°C", chaud: "20,1°C",
    neigeAn: 220, joursGel: 110
  },
  ax: { 
    pluie: 1050, soleil: 1950, 
    moyAn: "10,8°C", froid: "2,5°C", chaud: "20,8°C",
    neigeAn: 200, joursGel: 105
  }
};

export default function MeteoPyreneesPage() {
  const [pyreneData, setPyreneData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-orange-400" size={32} />;
    if (code >= 1 && code <= 3) return <CloudSun className="text-amber-500" size={32} />;
    if (code >= 71 && code <= 77) return <Snowflake className="text-cyan-400 animate-pulse" size={32} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code >= 95) return <CloudLightning className="text-indigo-600" size={32} />;
    return <Cloud className="text-slate-400" size={32} />;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/meteopyrenees');
        if (res.ok) {
          const data = await res.json();
          setPyreneData(data);
        }
      } catch (e) {
        console.error("Erreur chargement données Pyrénées:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-blue-600">
      <div className="animate-spin mb-4 text-4xl">🏔️</div>
      <p className="font-bold tracking-tight text-xl text-center">Analyse de l'enneigement et du climat<br/> des Pyrénées en cours...</p>
    </div>
  );

  if (!pyreneData) return <div className="p-10 text-center text-red-500 font-bold">Service montagne indisponible.</div>;

  return (
    <div className="px-4 max-w-6xl mx-auto mb-12">
      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <section className="bg-slate-50 text-slate-900 rounded-3xl shadow-2xl border border-blue-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Mountain size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Observatoire Pyrénées</h2>
          <p className="text-blue-100 opacity-90 font-medium">Suivi Neige & Normales Climatiques 2026</p>
        </div>

        {/* Grille Principale */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-100 bg-white/30">
          {Object.entries(pyreneData).map(([key, station]: [string, any], idx: number) => {
            const normale = NORMALES_CLIMAT[key as keyof typeof NORMALES_CLIMAT];
            
            return (
              <div key={idx} className="p-6 flex flex-col gap-6 hover:bg-blue-50/50 transition-all duration-300">
                
                {/* Entête Station & Température */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{station.ville}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getWeatherIcon(station.iconCode || station.condition)}
                      <span className={`text-[10px] font-black uppercase ${station.isSnowing ? "text-cyan-500 animate-pulse" : "text-slate-500"}`}>
                        {station.isSnowing ? "❄️ Neige en direct" : "Calme"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-blue-600 leading-none">{station.temp}°</span>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">Moy. An : {normale.moyAn}</p>
                  </div>
                </div>

                {/* Section Températures Extrêmes (Normales) */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg border border-cyan-100">
                        <Thermometer className="text-cyan-600" size={14} />
                        <div>
                            <p className="text-[8px] font-bold text-cyan-500 uppercase leading-none">Moy. Janvier</p>
                            <p className="text-xs font-black text-cyan-700">{normale.froid}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <Thermometer className="text-amber-500" size={14} />
                        <div>
                            <p className="text-[8px] font-bold text-amber-500 uppercase leading-none">Moy. Été</p>
                            <p className="text-xs font-black text-amber-700">{normale.chaud}</p>
                        </div>
                    </div>
                </div>

                {/* Compteurs Annuels */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 italic">Cumul Neige</p>
                    <p className="text-sm font-black text-cyan-600">{station.stats.cumulNeige} cm</p>
                    <p className="text-[7px] text-cyan-400 font-bold">Cible: {normale.neigeAn}cm</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Jours de Gel</p>
                    <p className="text-sm font-black text-blue-700">{station.stats.joursGel}j</p>
                    <p className="text-[7px] text-blue-400 font-bold italic">Normal: {normale.joursGel}j</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 italic text-red-500">Record Froid</p>
                    <p className="text-sm font-black text-red-600">{station.stats.recordFroid}</p>
                    <p className="text-[7px] text-slate-300">En 2026</p>
                  </div>
                </div>

                {/* Bloc Bilan détaillé */}
                <div className="bg-slate-900/5 rounded-2xl p-4 border border-blue-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-200/50 pb-2">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                      <Info size={12} /> Bilans Station
                    </h4>
                    <span className="text-[9px] font-bold text-blue-400 italic">Depuis 1er Janvier</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">❄️ Taux d'objectif Neige</span>
                      <div className="text-right">
                        <span className="text-xs font-black block">{Math.round((station.stats.cumulNeige / normale.neigeAn) * 100)}%</span>
                        <span className="text-[8px] text-slate-400">du cumul annuel visé</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-600">💧 Pluie (liquide)</span>
                      <div className="text-right">
                        <span className="text-xs font-black block">{station.stats.totalRain} mm</span>
                        <span className="text-[8px] text-slate-400">Normal /an: {normale.pluie}mm</span>
                      </div>
                    </div>

                    {/* Jauge Visuelle d'enneigement */}
                    <div className="pt-2 border-t border-blue-200/40">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-blue-800 italic">État des sommets</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded shadow-sm bg-blue-600 text-white">
                          {station.stats.cumulNeige} cm
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                          style={{ width: `${Math.min((station.stats.cumulNeige / normale.neigeAn) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Info Montagne */}
        <div className="bg-slate-900 text-slate-300 p-6 flex items-center gap-4">
          <Snowflake className="text-cyan-400 shrink-0 animate-spin-slow" size={30} />
          <p className="text-[10px] leading-relaxed italic">
            <b>Note Scientifique :</b> Les précipitations sont divisées entre pluie liquide et chutes de neige (en cm). 
            Le taux d'enneigement compare le cumul actuel à la moyenne historique annuelle de la station.
          </p>
        </div>
      </section>
    </div>
  );
}
