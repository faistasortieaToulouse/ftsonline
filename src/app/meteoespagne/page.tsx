"use client";
import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// --- 1. CONFIGURATION DES VILLES ---
const VILLES = [
  { id: "ainsa", label: "Ainsa" }, { id: "huesca", label: "Huesca" }, { id: "barbastro", label: "Barbastro" },
  { id: "lerida", label: "Lérida" }, { id: "tremp", label: "Tremp" }, { id: "berga", label: "Berga" },
  { id: "ripoll", label: "Ripoll" }, { id: "olot", label: "Olot" }, { id: "figueras", label: "Figueras" },
  { id: "cadaques", label: "Cadaqués" }, { id: "portbou", label: "Portbou" }, { id: "le-perthus", label: "Le Perthus" },
  { id: "pas-de-la-case", label: "Pas de la Case" }, { id: "bossost", label: "Bossòst" }, { id: "st-lary", label: "Saint-Lary" }
];

// --- 2. IMPORT DYNAMIQUE DE LA CARTE (Anti-erreur SSR) ---
const MapWithNoSSR = dynamic(() => import('@/components/MapEspagne'), { 
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2rem] flex items-center justify-center text-orange-400 font-bold">
      Chargement de la carte des Pyrénées...
    </div>
  )
});

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-amber-400" />, 
  1: <Sun className="text-amber-300" />,
  2: <Cloud className="text-slate-400" />, 
  3: <Cloud className="text-slate-500" />,
  61: <CloudRain className="text-blue-500" />,
  63: <CloudRain className="text-blue-600" />,
  95: <Sun className="text-purple-500" />, // Orage par défaut
};

export default function MeteoEspagne() {
  const [ville, setVille] = useState('ainsa');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Récupération du label pour l'en-tête
  const currentCityLabel = VILLES.find(v => v.id === ville)?.label || ville;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteoespagne?ville=${ville}`)
      .then(res => res.json())
      .then(data => { 
        setForecast(data.daily); 
        setLoading(false); 
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, [ville]);

  return (
    <div className="min-h-screen bg-orange-50/30 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:translate-x-[-2px] transition-transform text-sm">
              <ArrowLeft size={16} /> Retour Accueil
            </Link>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Météo <span className="text-orange-600">Espagne & Frontière</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 px-6 rounded-2xl shadow-sm border border-orange-100">
            <MapPin size={20} className="text-orange-600" />
            <span className="text-lg font-bold text-slate-800">{currentCityLabel}</span>
          </div>
        </div>

        {/* CARTE INTERACTIVE */}
        <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-orange-100 overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEUR DE VILLES (Boutons) */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sélectionner une destination</p>
          <div className="flex flex-wrap gap-2">
            {VILLES.map(v => (
              <button 
                key={v.id} 
                onClick={() => setVille(v.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  ville === v.id 
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-transparent hover:bg-orange-50 hover:border-orange-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DES PRÉVISIONS */}
        <section className="bg-white p-6 rounded-[2rem] shadow-xl border border-orange-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-orange-600 font-bold">Actualisation des données...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:bg-white hover:shadow-lg transition-all flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-3xl mb-4">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-xs font-bold text-orange-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>
                  
                  <div className="w-full pt-3 border-t border-slate-200/60 space-y-2 text-[9px] font-bold uppercase">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">UV</span>
                      <span className={forecast.uv_index_max[i] > 5 ? 'text-orange-600' : 'text-emerald-500'}>
                        {forecast.uv_index_max[i]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1"><Wind size={10}/> Vent</span>
                      <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i])}km/h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
