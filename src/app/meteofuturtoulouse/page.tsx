"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, MapPin, Thermometer } from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[550px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Initialisation de la carte Occitanie...</div>
});

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

// Liste exhaustive des 13 préfectures d'Occitanie
const VILLES_OCCITANIE = [
  { id: 'toulouse', label: 'Toulouse', dept: '31' },
  { id: 'montpellier', label: 'Montpellier', dept: '34' },
  { id: 'nimes', label: 'Nîmes', dept: '30' },
  { id: 'perpignan', label: 'Perpignan', dept: '66' },
  { id: 'beziers', label: 'Béziers', dept: '34' }, // Optionnel
  { id: 'carcassonne', label: 'Carcassonne', dept: '11' },
  { id: 'narbonne', label: 'Narbonne', dept: '11' }, // Optionnel
  { id: 'albi', label: 'Albi', dept: '81' },
  { id: 'montauban', label: 'Montauban', dept: '82' },
  { id: 'tarbes', label: 'Tarbes', dept: '65' },
  { id: 'rodez', label: 'Rodez', dept: '12' },
  { id: 'auch', label: 'Auch', dept: '32' },
  { id: 'cahors', label: 'Cahors', dept: '46' },
  { id: 'pamiers', label: 'Pamiers', dept: '09' }, // Ou Foix
  { id: 'mende', label: 'Mende', dept: '48' },
];

export default function MeteoFuturPage() {
  const [ville, setVille] = useState('toulouse');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-6 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
            Météo <span className="text-indigo-600">Occitanie</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-2">Cliquez sur une ville de la carte pour voir ses prévisions détaillées.</p>
        </header>

        {/* SECTION CARTE : On écoute le changement de ville via la carte */}
        <div className="mb-12 shadow-2xl rounded-3xl border-4 border-white overflow-hidden">
          <MapWithNoSSR onCityChange={(id: string) => setVille(id)} />
        </div>

        {/* Sélecteur de Ville (Tous les départements) */}
        <div className="mb-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sélection rapide du département</h2>
          <div className="flex flex-wrap gap-2">
            {VILLES_OCCITANIE.map((v) => (
              <button
                key={v.id}
                onClick={() => setVille(v.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  ville === v.id 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {v.label} ({v.dept})
              </button>
            ))}
          </div>
        </div>

        {/* SECTION PRÉVISIONS DÉTAILLÉES */}
        <section className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Thermometer size={120} />
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-8 capitalize flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
            Météo 7 jours : {ville.replace(/-/g, ' ')}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-400 font-bold animate-pulse">Récupération des données satellites...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="bg-slate-50/50 p-5 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg transition-all flex flex-col items-center group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-2xl font-black text-slate-900 leading-none">{Math.round(forecast.temperature_2m_max[i])}°</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">{Math.round(forecast.temperature_2m_min[i])}°</div>
                  </div>

                  <div className="w-full pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Pluie</span>
                      <span className="text-blue-500">{forecast.precipitation_sum[i]}mm</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold">
                      <span className="text-slate-400 uppercase">Indice UV</span>
                      <span className={forecast.uv_index_max[i] > 5 ? 'text-orange-500' : 'text-emerald-500'}>
                        {forecast.uv_index_max[i]}
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
