'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Wind, Sun, Droplets, Info, 
  Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, Thermometer, navigation
} from "lucide-react";

// Données fixes des normales saisonnières (Moyennes annuelles officielles)
const NORMALES_CLIMAT = {
  carcassonne: { pluie: 640, soleil: 2120, joursVent: 75 },
  lezignan: { pluie: 580, soleil: 2350, joursVent: 95 },
  narbonne: { pluie: 550, soleil: 2500, joursVent: 120 }
};

export default function MeteoAudePage() {
  const [audeData, setAudeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-orange-400" size={32} />;
    if (code >= 1 && code <= 3) return <CloudSun className="text-amber-500" size={32} />;
    if (code >= 45 && code <= 48) return <CloudFog className="text-slate-400" size={32} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code >= 80 && code <= 82) return <CloudRain className="text-blue-600" size={32} />;
    if (code >= 95) return <CloudLightning className="text-indigo-600" size={32} />;
    return <Cloud className="text-slate-400" size={32} />;
  };

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-indigo-600">
      <div className="animate-spin mb-4 text-4xl">🌀</div>
      <p className="font-bold tracking-tight">Analyse climatique de l'Aude...</p>
    </div>
  );

  if (!audeData) return <div className="p-10 text-center text-red-500">Service indisponible.</div>;

  return (
    <div className="px-4 max-w-6xl mx-auto mb-12">
      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <section className="bg-indigo-50 text-indigo-900 rounded-3xl shadow-xl border border-indigo-200 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sun size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic text-white">Météo de l'Aude</h2>
          <p className="text-indigo-100 opacity-90 font-medium tracking-wide">Carcassonne • Lézignan-Corbières • Narbonne</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-200 bg-white/30">
          {Object.entries(audeData).map(([key, ville]: [string, any], idx: number) => {
            const normale = NORMALES_CLIMAT[key as keyof typeof NORMALES_CLIMAT];
            
            return (
              <div key={idx} className="p-8 flex flex-col gap-6 hover:bg-white/60 transition-all duration-300">
                
                {/* 1. ENTETE : VILLE & TEMPÉRATURE */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight">{ville.ville}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getWeatherIcon(ville.iconCode)}
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{ville.condition}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-black text-indigo-600 leading-none">{ville.temp}°</span>
                    <span className="text-[9px] font-bold text-green-500 uppercase mt-2 animate-pulse">● Direct</span>
                  </div>
                </div>

                {/* 2. COMPTEURS DYNAMIQUES (Calculés par l'API) */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Jours Vent</p>
                    <p className="text-sm font-black text-indigo-700">{ville.stats.joursVentes}j</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Jours {">"}25°</p>
                    <p className="text-sm font-black text-orange-600">{ville.stats.joursChaleur}j</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Record An</p>
                    <p className="text-sm font-black text-red-600">{ville.stats.recordChaleur}</p>
                  </div>
                </div>

                {/* 3. BILAN CUMULÉ VS NORMALES (Fixes) */}
                <div className="bg-indigo-900/5 rounded-2xl p-5 border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2 border-b border-indigo-200/50 pb-2">
                    <Info size={14} className="text-indigo-400" />
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">État Climatique Annuel</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Soleil */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-700/60 uppercase">Soleil</span>
                        <span className="text-xs font-black text-indigo-900">{ville.stats.totalSunshine}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 italic font-medium">Norme: {normale.soleil}h</span>
                    </div>
                    
                    {/* Pluie */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-700/60 uppercase">Cumul Pluie</span>
                        <span className="text-xs font-black text-indigo-900">{ville.stats.totalRain} mm</span>
                      </div>
                      <span className="text-[9px] text-slate-400 italic font-medium">Norme: {normale.pluie}mm</span>
                    </div>

                    {/* Vent */}
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-700/60 uppercase">Rafale Max</span>
                        <span className="text-xs font-black text-indigo-900">{ville.stats.maxWind}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 italic font-medium">Vent {">"}57: {normale.joursVent}j/an</span>
                    </div>

                    {/* Hydrométrie Sol */}
                    <div className="pt-2 border-t border-indigo-200/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase text-indigo-800 tracking-widest text-xs">Bilan Hydrique</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded shadow-sm ${
                          ville.stats.waterBalance < 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {ville.stats.waterBalance} mm
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${ville.stats.waterBalance < 0 ? "bg-orange-400" : "bg-emerald-400"}`}
                          style={{ width: `${Math.min(Math.abs(ville.stats.waterBalance / 5), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note régionale explicative */}
        <div className="bg-indigo-950 text-indigo-300 p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="bg-indigo-800/50 p-3 rounded-full border border-indigo-700">
            <Thermometer className="text-cyan-400" size={24} />
          </div>
          <p className="text-[11px] leading-relaxed italic text-center md:text-left">
            <b>Comprendre les normales :</b> Les "Normes" indiquent les moyennes annuelles de référence (1991-2020). 
            Le nombre de <b>jours ventés</b> comptabilise les rafales supérieures à 57 km/h (Beaufort 7), caractéristiques du couloir de l'Aude.
            Un <b>bilan hydrique négatif</b> signale une évaporation supérieure aux précipitations, accentuant le risque de sécheresse agricole.
          </p>
        </div>
      </section>
    </div>
  );
}
