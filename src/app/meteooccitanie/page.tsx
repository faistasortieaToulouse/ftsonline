"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, 
  MapPin, Wind, Eye, Timer, SunMedium, CloudSun 
} from 'lucide-react';

// --- 1. DÉFINITION DES DONNÉES ---
const VILLES_PAR_DEPT: Record<string, { id: string, label: string, dept: string }[]> = {
  "Ariège (09)": [
    { id: "foix", label: "Foix", dept: "09" },
    { id: "pamiers", label: "Pamiers", dept: "09" },
    { id: "st-girons", label: "Saint-Girons", dept: "09" },
    { id: "lavelanet", label: "Lavelanet", dept: "09" },
    { id: "saverdun", label: "Saverdun", dept: "09" },
  ],
  "Aude (11)": [
    { id: "carcassonne", label: "Carcassonne", dept: "11" },
    { id: "narbonne", label: "Narbonne", dept: "11" },
    { id: "castelnaudary", label: "Castelnaudary", dept: "11" },
    { id: "lezignan", label: "Lézignan-Corbières", dept: "11" },
    { id: "limoux", label: "Limoux", dept: "11" },
  ],
  "Aveyron (12)": [
    { id: "rodez", label: "Rodez", dept: "12" },
    { id: "millau", label: "Millau", dept: "12" },
    { id: "villefranche-r", label: "Villefranche-de-R.", dept: "12" },
    { id: "st-affrique", label: "Saint-Affrique", dept: "12" },
    { id: "decazeville", label: "Decazeville", dept: "12" },
  ],
  "Gard (30)": [
    { id: "nimes", label: "Nîmes", dept: "30" },
    { id: "ales", label: "Alès", dept: "30" },
    { id: "bagnols", label: "Bagnols-sur-Cèze", dept: "30" },
    { id: "beaucaire", label: "Beaucaire", dept: "30" },
    { id: "st-gilles", label: "Saint-Gilles", dept: "30" },
  ],
  "Haute-Garonne (31)": [
    { id: "toulouse", label: "Toulouse", dept: "31" },
    { id: "st-gaudens", label: "Saint-Gaudens", dept: "31" },
    { id: "luchon", label: "Bagnères de Luchon", dept: "31" },
    { id: "carbonne", label: "Carbonne", dept: "31" },
    { id: "revel", label: "Revel", dept: "31" },
  ],
  "Gers (32)": [
    { id: "auch", label: "Auch", dept: "32" },
    { id: "isle-jourdain", label: "L'Isle-Jourdain", dept: "32" },
    { id: "condom", label: "Condom", dept: "32" },
    { id: "fleurance", label: "Fleurance", dept: "32" },
    { id: "eauze", label: "Eauze", dept: "32" },
  ],
  "Hérault (34)": [
    { id: "montpellier", label: "Montpellier", dept: "34" },
    { id: "beziers", label: "Béziers", dept: "34" },
    { id: "sete", label: "Sète", dept: "34" },
    { id: "agde", label: "Agde", dept: "34" },
    { id: "lunel", label: "Lunel", dept: "34" },
  ],
  "Lot (46)": [
    { id: "cahors", label: "Cahors", dept: "46" },
    { id: "figeac", label: "Figeac", dept: "46" },
    { id: "gourdon", label: "Gourdon", dept: "46" },
    { id: "gramat", label: "Gramat", dept: "46" },
    { id: "souillac", label: "Souillac", dept: "46" },
  ],
  "Lozère (48)": [
    { id: "mende", label: "Mende", dept: "48" },
    { id: "marvejols", label: "Marvejols", dept: "48" },
    { id: "st-chely", label: "Saint-Chély-d'Apcher", dept: "48" },
    { id: "langogne", label: "Langogne", dept: "48" },
    { id: "peyre-aubrac", label: "Peyre en Aubrac", dept: "48" },
  ],
  "Hautes-Pyrénées (65)": [
    { id: "tarbes", label: "Tarbes", dept: "65" },
    { id: "lourdes", label: "Lourdes", dept: "65" },
    { id: "aureilhan", label: "Aureilhan", dept: "65" },
    { id: "bagneres-bigorre", label: "Bagnères-de-Bigorre", dept: "65" },
    { id: "lannemezan", label: "Lannemezan", dept: "65" },
  ],
  "Pyrénées Orientales (66)": [
    { id: "perpignan", label: "Perpignan", dept: "66" },
    { id: "canet", label: "Canet-en-Roussillon", dept: "66" },
    { id: "st-esteve", label: "Saint-Estève", dept: "66" },
    { id: "st-cyprien", label: "Saint-Cyprien", dept: "66" },
    { id: "argeles", label: "Argelès-sur-Mer", dept: "66" },
  ],
  "Tarn (81)": [
    { id: "albi", label: "Albi", dept: "81" },
    { id: "castres", label: "Castres", dept: "81" },
    { id: "gaillac", label: "Gaillac", dept: "81" },
    { id: "graulhet", label: "Graulhet", dept: "81" },
    { id: "lavaur", label: "Lavaur", dept: "81" },
  ],
  "Tarn et Garonne (82)": [
    { id: "montauban", label: "Montauban", dept: "82" },
    { id: "castelsarrasin", label: "Castelsarrasin", dept: "82" },
    { id: "moissac", label: "Moissac", dept: "82" },
    { id: "caussade", label: "Caussade", dept: "82" },
    { id: "montech", label: "Montech", dept: "82" },
  ],
  "Andorre": [
    { id: "andorra-vella", label: "Andorra la Vella", dept: "AD" },
    { id: "escaldes", label: "Escaldes-Eng.", dept: "AD" },
    { id: "encamp", label: "Encamp", dept: "AD" },
    { id: "sant-julia", label: "Sant Julià de Lòria", dept: "AD" },
    { id: "la-massana", label: "La Massana", dept: "AD" },
    { id: "ordino", label: "Ordino", dept: "AD" },
    { id: "canillo", label: "Canillo", dept: "AD" },
  ]
};

const getCityLabel = (id: string) => {
  for (const group of Object.values(VILLES_PAR_DEPT)) {
    const city = group.find(v => v.id === id);
    if (city) return city.label;
  }
  return id;
};

const icons: Record<number, React.ReactNode> = {
  0: <Sun className="text-orange-400" />,
  1: <Sun className="text-orange-300" />,
  2: <CloudSun className="text-amber-400" />,
  3: <Cloud className="text-gray-400" />,
  45: <Cloud className="text-slate-300" />, 
  61: <CloudRain className="text-blue-500" />,
  63: <CloudRain className="text-blue-600" />,
  95: <CloudLightning className="text-purple-600" />,
};

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-black italic uppercase text-xs">Radar Occitanie en cours...</div>
});

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [activeDept, setActiveDept] = useState("Haute-Garonne (31)");
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const departements = useMemo(() => Object.keys(VILLES_PAR_DEPT), []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteooccitanie?ville=${ville}`)
      .then(res => res.json())
      .then(data => {
        setForecast(data.daily);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [ville]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-black hover:translate-x-[-2px] transition-transform text-[10px] uppercase italic tracking-widest">
              <ArrowLeft size={14} /> Retour Accueil
            </Link>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Météo <span className="text-indigo-600">Occitanie</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Prévisions régionales & monitoring</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 px-6 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-4">
            <MapPin size={20} className="text-indigo-600 animate-bounce" />
            <span className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{getCityLabel(ville)}</span>
          </div>
        </div>

        {/* CARTE */}
        <div className="bg-white p-2 rounded-[3rem] shadow-2xl border border-indigo-50 overflow-hidden h-[450px]">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEURS */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Secteur Géographique</p>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {departements.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                    activeDept === dept 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-500 border-transparent hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Poste de surveillance</p>
            <div className="flex flex-wrap gap-2">
              {VILLES_PAR_DEPT[activeDept].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVille(v.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                    ville === v.id 
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRÉVISIONS */}
        <section className="bg-white p-6 md:p-8 rounded-[3rem] shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none uppercase font-black text-6xl italic">7 Days</div>
          
          <div className="flex items-center justify-between mb-8 px-2 relative z-10">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              Tendance Hebdomadaire
            </h2>
            <span className="hidden md:block text-[10px] font-black text-indigo-400 uppercase border-b-2 border-indigo-100 pb-1 italic">Mise à jour en temps réel</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-8 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-indigo-400 font-black uppercase tracking-widest text-xs italic">Capture des données satellites...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className={`p-5 rounded-[2.5rem] border transition-all flex flex-col items-center group ${
                  i === 0 ? 'bg-indigo-50/50 border-indigo-100 shadow-inner' : 'bg-slate-50/50 border-transparent hover:bg-white hover:shadow-2xl hover:border-indigo-50'
                }`}>
                  
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>
                  
                  <div className="text-center mb-6 leading-none">
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-200/50 space-y-3">
                    {/* BLOC VENT */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-blue-400"><Wind size={12} /> Vent</div>
                      <span className="text-slate-700">{Math.round(forecast.windspeed_10m_max[i] || 0)} <small className="text-[7px]">km/h</small></span>
                    </div>

                    {/* BLOC UV */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-orange-500"><SunMedium size={12} /> Indice UV</div>
                      <span className={`px-1.5 py-0.5 rounded ${forecast?.uv_index_max?.[i] > 5 ? 'bg-orange-500 text-white' : 'text-slate-700 bg-orange-100/50'}`}>
                        {forecast?.uv_index_max?.[i]?.toFixed(1) || "0.0"}
                      </span>
                    </div>

                    {/* BLOC VISIBILITÉ */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase">
                      <div className="flex items-center gap-1.5 text-emerald-500"><Eye size={12} /> Visib.</div>
                      <span className="text-slate-700">24 <small className="text-[7px]">km</small></span>
                    </div>

                    {/* BLOC DURÉE DU JOUR */}
                    <div className="bg-white rounded-xl p-2 flex justify-center items-center gap-1.5 border border-indigo-50 shadow-sm mt-2">
                      <Timer size={10} className="text-indigo-300" />
                      <span className="text-[8px] font-black text-slate-400">9h 54min</span>
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