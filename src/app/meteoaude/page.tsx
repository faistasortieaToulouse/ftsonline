'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wind, Sun, Droplets, Thermometer, Info } from "lucide-react";

export default function MeteoAudePage() {
  const [audeData, setAudeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/meteoaude');
        if (res.ok) {
          const data = await res.json();
          setAudeData(data);
        }
      } catch (e) {
        console.error("Erreur chargement données Aude:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-indigo-600">
        <div className="animate-spin mb-4 text-4xl">🌀</div>
        <p className="font-bold">Analyse des données de l'Aude en cours...</p>
      </div>
    );
  }

  if (!audeData) return <div className="p-10 text-center">Indisponible pour le moment.</div>;

  return (
    <div className="px-4 max-w-6xl mx-auto mb-12">
      
      {/* Navigation */}
      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <section className="bg-indigo-50 text-indigo-900 rounded-3xl shadow-xl border border-indigo-200 overflow-hidden">
        
        {/* En-tête Dynamique */}
        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sun size={120} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Comparatif Météo Aude</h2>
          <p className="text-indigo-100 italic opacity-90">Analyse en temps réel : Carcassonne • Lézignan • Narbonne</p>
        </div>

        {/* GRILLE DE COMPARAISON */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-200 bg-white/30">
          
          {Object.values(audeData).map((ville: any, idx: number) => (
            <div key={idx} className="p-8 flex flex-col gap-6 hover:bg-white/60 transition-all duration-300">
              
              {/* Ville & Température */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-indigo-950 tracking-tight">{ville.ville}</h3>
                  <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase text-[10px] mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En direct
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-black text-indigo-600">{ville.temp}°</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">{ville.condition}</span>
                </div>
              </div>

              {/* Indicateurs instantanés */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Wind size={14} />
                    <span className="text-[9px] font-black uppercase">Vent</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-900">{ville.vitesseVent} <small className="text-[10px]">km/h</small></span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Sun size={14} />
                    <span className="text-[9px] font-black uppercase">Indice UV</span>
                  </div>
                  <span className="text-sm font-bold text-indigo-900">{ville.uv} <small className="text-[10px]">max</small></span>
                </div>
              </div>

              {/* BLOC BILAN ANNUEL */}
              <div className="bg-indigo-900/5 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4 border-b border-indigo-200/50 pb-2">
                  <Info size={14} className="text-indigo-400" />
                  <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                    Bilan depuis le 1er Janv.
                  </h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center group">
                    <span className="text-xs text-indigo-700/70 font-medium">☀️ Ensoleillement</span>
                    <b className="text-xs font-bold text-indigo-900 bg-white px-2 py-1 rounded-md shadow-sm">
                      {ville.stats?.totalSunshine || '--'}
                    </b>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-700/70 font-medium">💧 Cumul Pluie</span>
                    <b className="text-xs font-bold text-indigo-900 bg-white px-2 py-1 rounded-md shadow-sm">
                      {ville.stats?.totalRain}mm
                    </b>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-700/70 font-medium">🌪️ Rafale Max</span>
                    <b className="text-xs font-bold text-indigo-900 bg-white px-2 py-1 rounded-md shadow-sm">
                      {ville.stats?.maxWind || '--'}
                    </b>
                  </div>

                  <div className="pt-2 mt-2 border-t border-indigo-200/40">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-800">🌱 État du Sol</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${
                        ville.stats?.waterBalance < 0 
                        ? "bg-orange-100 text-orange-700" 
                        : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {ville.stats?.waterBalance} mm
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-indigo-200/30 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${ville.stats?.waterBalance < 0 ? "bg-orange-400" : "bg-emerald-400"}`}
                        style={{ width: `${Math.abs(ville.stats?.waterBalance / 5)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info - Note sur la Cers et l'Autan */}
        <div className="bg-indigo-950 text-indigo-200 p-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="bg-indigo-800 p-3 rounded-full">
            <Droplets className="text-cyan-400" size={24} />
          </div>
          <div>
            <p className="text-[11px] leading-relaxed italic">
              <b>Note régionale :</b> Les données de sol (ET0) prennent en compte l'évaporation accélérée par la <b>Cers</b> (vent de Nord-Ouest) et l'<b>Autan</b>. 
              Le Narbonnais présente historiquement un déficit hydrique plus précoce que le Carcassonnais.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
