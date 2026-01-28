"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Navigation, Timer, Calendar, ArrowLeft, MapPin } from 'lucide-react';

export default function MeteoLac() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    fetch('/api/meteolac')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error("Erreur:", err));
  }, []);

  const calculerDureeJour = (sunrise: string, sunset: string) => {
    if (!sunrise || !sunset) return "--";
    const [h1, m1] = sunrise.split(':').map(Number);
    const [h2, m2] = sunset.split(':').map(Number);
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    return `${Math.floor(diffMinutes / 60)}h ${(diffMinutes % 60).toString().padStart(2, '0')}min`;
  };

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={32} />;
    if (code <= 48) return <Cloud className="text-gray-400 fill-gray-100" size={32} />;
    return <CloudRain className="text-blue-500" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="font-bold text-emerald-900 italic">Analyse des plans d'eau en cours...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <nav className="mb-6 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour Accueil
        </Link>
      </nav>

      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Navigation className="text-emerald-600 fill-emerald-600" size={36} /> Météo des Lacs
          </h1>
          <p className="text-slate-500 font-medium mt-1">Baignades et bases de loisirs autour de Toulouse</p>
        </div>
        <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3">
          <Calendar className="text-emerald-600" size={20} />
          <span className="text-slate-900 font-bold capitalize">{dateAujourdhui}</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((lac, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl transition-all group">
            <div className="bg-emerald-700 p-5 text-white">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-lg tracking-tight">{lac.name}</span>
                <span className="text-3xl font-black">{lac.temp}°C</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100 text-xs font-bold uppercase tracking-widest">
                <MapPin size={12} /> {lac.city} ({lac.dept}) • {lac.dist}
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase font-black text-amber-600 mb-1 tracking-wider">Soleil</span>
                    <div className="text-lg font-bold text-amber-900">{lac.sunrise} | {lac.sunset}</div>
                    <div className="text-xs font-medium text-amber-700 mt-1 flex items-center gap-1">
                      <Timer size={14} /> Jour : {calculerDureeJour(lac.sunrise, lac.sunset)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-amber-100">
                    {getIcon(lac.code)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Wind size={20} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Vent</span>
                    <span className="text-sm font-black text-slate-900">{lac.wind} <small className="font-normal">km/h</small></span>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-[10px] font-black text-white">UV</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-orange-400">Indice</span>
                    <span className="text-sm font-black text-orange-900">{lac.uv}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ciel</span>
                 <span className="text-xs font-bold text-emerald-800">
                   {lac.code === 0 ? "Pur" : lac.code < 50 ? "Variable" : "Risque pluie"}
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <footer className="max-w-7xl mx-auto mt-12 mb-8 text-center text-slate-400 text-[10px] uppercase tracking-widest">
        Distances calculées au départ de Toulouse Centre. Données API rafraîchies toutes les 15 min.
      </footer>
    </div>
  );
}