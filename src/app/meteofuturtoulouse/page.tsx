"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, Thermometer, MapPin, Wind, ChevronRight } from 'lucide-react';

// --- 1. DÉFINITION DES DONNÉES (Indispensable ici pour le Build) ---
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-2px] transition-transform text-sm">
              <ArrowLeft size={16} /> Retour Accueil
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Météo <span className="text-indigo-600">Occitanie</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 px-6 rounded-2xl shadow-sm border border-slate-200">
            <MapPin size={20} className="text-indigo-600" />
            <span className="text-lg font-bold text-slate-800">{getCityLabel(ville)}</span>
          </div>
        </div>

        {/* CARTE */}
        <div className="bg-white p-2 rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* SÉLECTEURS COMPACTS (Supprime le blanc) */}
        <div className="grid grid-cols-1 gap-4">
          {/* Liste Départements Horizontale */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">1. Choisir un département</p>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
              {departements.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeDept === dept 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Liste Villes Compacte */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">2. Choisir une ville</p>
            <div className="flex flex-wrap gap-2">
              {VILLES_PAR_DEPT[activeDept].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVille(v.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    ville === v.id 
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRÉVISIONS (Remontées car les sélecteurs sont courts) */}
        <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800">Prévisions 7 jours</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:bg-white hover:shadow-lg transition-all flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase mb-4 text-center">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <div className="text-3xl mb-4">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>
                  <div className="w-full pt-3 border-t border-slate-200/60 space-y-2">
                    {/* BLOC PLUIE */}
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Pluie</span>
                      <span className="text-blue-500">{forecast.precipitation_sum[i]}mm</span>
                    </div>

                    {/* BLOC UV - Corrigé pour fonctionner sans variable 'const' */}
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter">Indice UV</span>
                      <span className={forecast?.uv_index_max?.[i] > 5 ? 'text-orange-500' : 'text-emerald-500'}>
                        {forecast?.uv_index_max?.[i] || 0}
                      </span>
                    </div>

                    {/* BLOC VENT */}
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 uppercase flex items-center gap-1">
                        <Wind size={10} /> Vent
                      </span>
                      <span className="text-slate-700">
                        {Math.round(forecast.windspeed_10m_max[i] || 0)}km/h
                      </span>
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
