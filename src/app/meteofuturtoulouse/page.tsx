"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer, ChevronRight, Wind, MapPin } from 'lucide-react';

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

// --- 2. HELPERS ---
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
  2: <Cloud className="text-gray-400" />,
  3: <Cloud className="text-gray-500" />,
  45: <Cloud className="text-slate-300" />, 
  61: <CloudRain className="text-blue-500" />,
  63: <CloudRain className="text-blue-600" />,
  95: <CloudLightning className="text-purple-600" />,
};

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Chargement de la carte...</div>
});

// --- 3. COMPOSANT PRINCIPAL ---
export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [activeDept, setActiveDept] = useState("Haute-Garonne (31)");
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const departements = useMemo(() => Object.keys(VILLES_PAR_DEPT), []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meteofuturtoulouse?ville=${ville}`)
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-4px] transition-transform mb-2">
              <ArrowLeft size={18} /> Retour
            </Link>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
              Météo <span className="text-indigo-600">Occitanie</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ville sélectionnée</p>
              <p className="text-xl font-bold text-slate-800">{getCityLabel(ville)}</p>
            </div>
          </div>
        </div>

        {/* Section Carte */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* Section Sélecteurs : Alignement amélioré */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Colonne Départements (4/12) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               Départements
            </h2>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {departements.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all flex items-center justify-between group ${
                    activeDept === dept 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                  }`}
                >
                  {dept}
                  <ChevronRight size={16} className={`${activeDept === dept ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`} />
                </button>
              ))}
            </div>
          </div>

          {/* Colonne Villes (8/12) : Suppression du blanc */}
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 self-stretch flex flex-col">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               Villes dans le secteur
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {VILLES_PAR_DEPT[activeDept].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVille(v.id)}
                  className={`px-4 py-4 rounded-2xl text-sm font-bold transition-all border text-center ${
                    ville === v.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-[1.02]' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            
            {/* Petit indicateur visuel en bas pour combler élégamment si besoin */}
            <div className="mt-auto pt-10 text-center opacity-30 grayscale pointer-events-none hidden md:block">
               <Sun size={40} className="mx-auto text-slate-300" />
            </div>
          </div>
        </div>

        {/* Section Météo 7 Jours */}
        <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12">
            <Thermometer size={300} />
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="w-1.5 h-10 bg-indigo-600 rounded-full"></div>
            <h3 className="text-3xl font-black text-slate-800">
              Prévisions <span className="text-indigo-600">7 jours</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse">Mise à jour des prévisions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {forecast?.time?.map((date: string, i: number) => {
                const windSpeed = Math.round(forecast?.windspeed_10m_max?.[i] || 0);
                return (
                  <div key={date} className="bg-slate-50/50 p-6 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all flex flex-col items-center group">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                    </span>
                    
                    <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-3xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                      <div className="text-sm font-bold text-indigo-400 mt-2">{Math.round(forecast.temperature_2m_min[i])}°</div>
                    </div>

                    <div className="w-full pt-4 border-t border-slate-200/60 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400 uppercase">Pluie</span>
                        <span className="text-blue-500 font-black">{forecast.precipitation_sum[i]}mm</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t border-slate-100">
                        <span className="text-slate-400 uppercase flex items-center gap-1">
                          <Wind size={12} className={windSpeed > 40 ? 'text-orange-500' : 'text-slate-300'} /> Vent
                        </span>
                        <span className={windSpeed > 40 ? 'text-orange-600 font-black' : 'text-slate-700 font-black'}>
                          {windSpeed} <span className="text-[8px]">km/h</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
