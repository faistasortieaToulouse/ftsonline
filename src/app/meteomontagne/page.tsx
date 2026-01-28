"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Timer, Calendar, ArrowLeft, Snowflake, Mountain, Eye, ThermometerSnowflake, AlertTriangle } from 'lucide-react';

export default function MeteoMontagne() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  useEffect(() => {
    async function fetchMeteo() {
      try {
        const res = await fetch('/api/meteomontagne', { cache: 'no-store' });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Erreur serveur (${res.status})`);
        }

        const d = await res.json();
        
        if (Array.isArray(d)) {
          setData(d);
        } else {
          throw new Error("Le format des données est incorrect.");
        }
      } catch (err: any) {
        console.error("Erreur détaillée:", err.message);
        setError(err.message || "Impossible de charger la météo.");
      } finally {
        setLoading(false);
      }
    }

    fetchMeteo();
  }, []);

  const calculerDureeJour = (sunrise: string, sunset: string) => {
    if (!sunrise || !sunset) return "--";
    try {
      const [h1, m1] = sunrise.split(':').map(Number);
      const [h2, m2] = sunset.split(':').map(Number);
      let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      return `${Math.floor(diffMinutes / 60)}h ${(diffMinutes % 60).toString().padStart(2, '0')}min`;
    } catch (e) { return "--"; }
  };

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-amber-500 fill-amber-100" size={32} />;
    if (code <= 48) return <Cloud className="text-slate-400 fill-slate-100" size={32} />;
    return <CloudRain className="text-blue-500" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="font-bold text-indigo-900 italic">Connexion aux sommets...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 text-center max-w-md">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur de connexion</h2>
        <p className="text-slate-500 mb-6 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <nav className="mb-6 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour Accueil
        </Link>
      </nav>

      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-700">
            <Mountain className="text-indigo-600" size={40} /> Météo Montagne
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-tighter text-xs">Pyrénées : Ariège, Garonne & Hautes-Pyrénées</p>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
          <Calendar className="text-indigo-600" size={20} />
          <span className="text-slate-900 font-bold capitalize">{dateAujourdhui}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((station, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
            <div className="bg-indigo-900 p-5 text-white flex justify-between items-center">
              <span className="font-bold text-lg">{station.name}</span>
              <span className="text-3xl font-black">{station.temp}°C</span>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex justify-between items-start text-amber-900">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Soleil</span>
                    <div className="text-lg font-bold">{station.sunrise} | {station.sunset}</div>
                    <div className="text-xs font-medium flex items-center gap-1 mt-1">
                      <Timer size={14}/> Jour : {calculerDureeJour(station.sunrise, station.sunset)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-amber-100">
                    {getIcon(station.code)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
                    <Snowflake size={10}/> Neige (24h)
                  </span>
                  <div className="text-sm font-bold text-blue-900">
                    {station.snow > 0 ? `${station.snow} cm` : "Néant"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <ThermometerSnowflake size={10}/> Isotherme 0°C
                  </span>
                  <div className="text-sm font-bold text-slate-900">{station.isotherme} m</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Wind size={18} className="text-indigo-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Vent</span>
                    <span className="text-sm font-black">{station.wind} <small className="text-[10px]">km/h</small></span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${station.visibility < 2 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <Eye size={18} className={station.visibility < 2 ? 'text-red-600 animate-pulse' : 'text-green-600'} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase opacity-70">Visibilité</span>
                    <span className="text-sm font-black uppercase">
                      {station.visibility < 2 ? 'Jour Blanc' : `${Math.round(station.visibility)}km`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg">
                   <div className="w-5 h-5 bg-orange-500 rounded text-[9px] text-white font-black flex items-center justify-center">UV</div>
                   <span className="text-sm font-black text-slate-700">{station.uv}</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest italic">Station Ski</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}