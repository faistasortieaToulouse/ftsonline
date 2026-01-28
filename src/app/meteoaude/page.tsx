'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Wind, Sun, Info, 
  Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, Thermometer, Calendar
} from "lucide-react";

// Données fixes enrichies : Normales Climatiques Annuelles (1991-2020)
const NORMALES_CLIMAT = {
  carcassonne: { 
    pluie: 640, soleil: 2120, joursVent: 75, 
    estivaux: 85, moyAn: "14,5°C", froid: "6,8°C", chaud: "23,2°C" 
  },
  lezignan: { 
    pluie: 580, soleil: 2350, joursVent: 95, 
    estivaux: 95, moyAn: "14,8°C", froid: "7,0°C", chaud: "23,5°C" 
  },
  narbonne: { 
    pluie: 550, soleil: 2500, joursVent: 120, 
    estivaux: 105, moyAn: "15,4°C", froid: "8,2°C", chaud: "23,8°C" 
  }
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
      <p className="font-bold tracking-tight text-xl text-center">Analyse des données climatiques<br/> de l'Aude en cours...</p>
    </div>
  );

  if (!audeData) return <div className="p-10 text-center text-red-500 font-bold">Service météorologique indisponible.</div>;

  return (
    <div className="px-4 max-w-6xl mx-auto mb-12">
      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <section className="bg-indigo-50 text-indigo-900 rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Sun size={120} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Observatoire de l'Aude</h2>
          <p className="text-indigo-100 opacity-90 font-medium">Cumuls depuis le 1er Janvier vs Normales de Saison</p>
        </div>

        {/* Grille Principale */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-200 bg-white/30">
          {Object.entries(audeData).map(([key, ville]: [string, any], idx: number) => {
            const normale = NORMALES_CLIMAT[key as keyof typeof NORMALES_CLIMAT];
            
            return (
              <div key={idx} className="p-6 flex flex-col gap-6 hover:bg-white/60 transition-all duration-300">
                
                {/* Entête Ville & Température */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-indigo-950 tracking-tight leading-tight">{ville.ville}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getWeatherIcon(ville.iconCode)}
                      <span className="text-[10px] font-black text-indigo-500 uppercase">{ville.condition}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-indigo-600 leading-none">{ville.temp}°</span>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">Moy. An : {normale.moyAn}</p>
                  </div>
                </div>

                {/* Section Températures Extrêmes (Normales) */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <Thermometer className="text-blue-500" size={14} />
                        <div>
                            <p className="text-[8px] font-bold text-blue-400 uppercase leading-none">Moy. Janvier</p>
                            <p className="text-xs font-black text-blue-700">{normale.froid}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg border border-orange-100">
                        <Thermometer className="text-orange-500" size={14} />
                        <div>
                            <p className="text-[8px] font-bold text-orange-400 uppercase leading-none">Moy. Été</p>
                            <p className="text-xs font-black text-orange-700">{normale.chaud}</p>
                        </div>
                    </div>
                </div>

                {/* Compteurs Annuels Dynamiques */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Vent{">"}57 km/h</p>
                    <p className="text-sm font-black text-indigo-700">{ville.stats.joursVentes}j</p>
                    <p className="text-[7px] text-indigo-400 font-bold italic">Normal: {normale.joursVent}j</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Jours {">"}25°C</p>
                    <p className="text-sm font-black text-orange-600">{ville.stats.joursChaleur}j</p>
                    <p className="text-[7px] text-orange-400 font-bold italic">Normal: {normale.estivaux}j</p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-indigo-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Record 2026</p>
                    <p className="text-sm font-black text-red-600">{ville.stats.recordChaleur}</p>
                    <p className="text-[7px] text-slate-300">Rafale Max</p>
                  </div>
                </div>

                {/* Bloc Bilan vs Normales Annuelles */}
                <div className="bg-indigo-900/5 rounded-2xl p-4 border border-indigo-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-200/50 pb-2">
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1">
                      <Info size={12} /> Cumuls vs Normales
                    </h4>
                    <span className="text-[9px] font-bold text-indigo-400 italic">Depuis 1er Janvier</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Soleil */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-700/70">☀️ Ensoleillement</span>
                      <div className="text-right">
                        <span className="text-xs font-black block">{ville.stats.totalSunshine}</span>
                        <span className="text-[8px] text-slate-400">Normal /an: {normale.soleil}h</span>
                      </div>
                    </div>
                    
                    {/* Pluie */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-700/70">💧 Cumul Pluie</span>
                      <div className="text-right">
                        <span className="text-xs font-black block">{ville.stats.totalRain} mm</span>
                        <span className="text-[8px] text-slate-400">Normal /an: {normale.pluie}mm</span>
                      </div>
                    </div>

                    {/* Hydrométrie Sol */}
                    <div className="pt-2 border-t border-indigo-200/40">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-indigo-800">Bilan Sol (Pluie-Evap)</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${
                          ville.stats.waterBalance < 0 ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {ville.stats.waterBalance > 0 ? '+' : ''}{ville.stats.waterBalance} mm
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
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
        
        {/* ... (Reste du code : Sections Vents et Footer inchangés) */}
      </section>
    </div>
  );
}
