"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Sun, Cloud, CloudRain, CloudLightning, ArrowLeft, MapPin } from 'lucide-react';

// Chargement dynamique de la carte située dans src/components/Map.tsx
const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-[550px] w-full bg-slate-200 animate-pulse rounded-3xl flex items-center justify-center text-slate-400">Chargement de la carte régionale...</div>
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

// Liste des villes pour le sélecteur (doit correspondre à ton API)
const VILLES_OCCITANIE = [
  { id: 'toulouse', label: 'Toulouse', dept: '31' },
  { id: 'carcassonne', label: "L'Aude", dept: '11' },
  { id: 'montpellier', label: 'Hérault', dept: '34' },
  { id: 'nimes', label: 'Gard', dept: '30' },
  { id: 'perpignan', label: 'Pyr.-Orientales', dept: '66' },
  { id: 'albi', label: 'Tarn', dept: '81' },
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
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link href="/" className="flex items-center gap-2 text-indigo-600 mb-8 font-bold hover:translate-x-[-4px] transition-transform w-fit">
          <ArrowLeft size={18} /> Retour Accueil
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">
            Météo <span className="text-indigo-600">Occitanie</span>
          </h1>
          <p className="text-slate-500 italic">Prévisions détaillées de la région</p>
        </header>

        {/* SECTION CARTE (Affiche maintenant tous les départements) */}
        <div className="mb-10">
          <MapWithNoSSR ville={ville} />
        </div>

        {/* Sélecteur de Ville pour les prévisions détaillées */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zoom sur une ville :</h2>
          <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-fit">
            {VILLES_OCCITANIE.map((v) => (
              <button
                key={v.id}
                onClick={() => setVille(v.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  ville === v.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <MapPin size={14} />
                {v.label} ({v.dept})
              </button>
            ))}
          </div>
        </div>

        {/* SECTION PRÉVISIONS DÉTAILLÉES */}
        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-900 mb-6 capitalize">
            7 jours à {ville.replace(/-/g, ' ')}
          </h3>

          {loading ? (
            <div className="text-center py-10 text-indigo-300 animate-pulse font-bold italic">
              Consultation des relevés satellites...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {forecast?.time?.map((date: string, i: number) => (
                <div key={date} className="bg-white p-5 rounded-3xl border border-white shadow-sm flex flex-col items-center hover:scale-105 transition-transform">
                  <span className="text-[11px] font-black text-slate-400 uppercase">
                    {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                  </span>
                  
                  <div className="text-4xl my-5">
                    {icons[forecast.weathercode[i]] || <Cloud className="text-slate-300" />}
                  </div>

                  <div className="flex flex-col items-center mb-4">
                    <span className="text-2xl font-black text-indigo-950">{Math.round(forecast.temperature_2m_max[i])}°</span>
                    <span className="text-xs font-bold text-indigo-300">{Math.round(forecast.temperature_2m_min[i])}°</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 w-full text-[10px] space-y-1 font-bold text-slate-400">
                    <div className="flex justify-between text-blue-500">
                      <span>Pluie</span>
                      <span>{forecast.precipitation_sum[i]}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UV</span>
                      <span className={forecast.uv_index_max[i] > 5 ? 'text-orange-500' : 'text-emerald-500'}>
                        {forecast.uv_index_max[i]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
