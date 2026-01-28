"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { Sun, Wind, Cloud, CloudRain, Navigation, Timer, Calendar, ArrowLeft } from 'lucide-react';

export default function MeteoPlage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Date du jour formatée
  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetch('/api/meteoplage')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => console.error("Erreur chargement météo:", err));
  }, []);

  // Fonction pour calculer la durée du jour (ex: 9h 43min)
  const calculerDureeJour = (sunrise: string, sunset: string) => {
    if (!sunrise || !sunset) return "--";
    const [h1, m1] = sunrise.split(':').map(Number);
    const [h2, m2] = sunset.split(':').map(Number);
    
    let diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const heures = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${heures}h ${minutes.toString().padStart(2, '0')}min`;
  };

  const getIcon = (code: number) => {
    if (code <= 3) return <Sun className="text-orange-500 fill-orange-100" size={32} />;
    if (code <= 48) return <Cloud className="text-gray-400 fill-gray-100" size={32} />;
    return <CloudRain className="text-blue-500" size={32} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="font-bold text-blue-900">Calcul de l'éphéméride et météo des plages...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">

      <nav className="mb-6 mt-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* --- EN-TÊTE --- */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
            <Navigation className="fill-blue-900" /> Météo des Plages
          </h1>
          <p className="text-slate-500 font-medium mt-1">État du ciel et durée d'ensoleillement en temps réel</p>
        </div>

        {/* Badge Date du jour */}
        <div className="bg-white border border-blue-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-3 self-start md:self-auto">
          <Calendar className="text-blue-600" size={20} />
          <span className="text-blue-900 font-bold capitalize">
            {dateAujourdhui}
          </span>
        </div>
      </header>

      {/* --- GRILLE DES PLAGES --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((plage, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            
            {/* Header : Nom et Température */}
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <span className="font-bold text-lg tracking-tight">{plage.name}</span>
              <span className="text-3xl font-black">{plage.temp}°C</span>
            </div>

            <div className="p-5 space-y-5">
              
              {/* BLOC SOLEIL (Format spécifique demandé) */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase font-black text-amber-600 mb-1 tracking-wider">Soleil</span>
                    <div className="text-lg font-bold text-amber-900">
                      {plage.sunrise} | {plage.sunset}
                    </div>
                    <div className="text-xs font-medium text-amber-700 mt-1 flex items-center gap-1">
                      <Timer size={14} /> Jour : {calculerDureeJour(plage.sunrise, plage.sunset)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-amber-100">
                    {getIcon(plage.code)}
                  </div>
                </div>
              </div>

              {/* SECTION VENT / UV */}
              <div className="grid grid-cols-2 gap-4">
                {/* Vent */}
                <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <Wind size={20} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-blue-400">Vent</span>
                    <span className="text-sm font-black text-blue-900">{plage.wind} <small className="text-[10px] font-normal">km/h</small></span>
                  </div>
                </div>

                {/* UV */}
                <div className="flex items-center gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">UV</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-orange-400">Indice</span>
                    <span className="text-sm font-black text-orange-900">{plage.uv}</span>
                  </div>
                </div>
              </div>

              {/* Statut du ciel (bas de carte) */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">État du ciel</span>
                 <span className="text-xs font-bold text-slate-700 capitalize">
                   {plage.code === 0 ? "Ciel parfaitement dégagé" : plage.code < 50 ? "Partiellement couvert" : "Risque de précipitations"}
                 </span>
              </div>

            </div>
          </div>
        ))}
      </div>
      
      <footer className="max-w-7xl mx-auto mt-12 mb-8 text-center text-slate-400 text-xs">
        Données basées sur les coordonnées GPS exactes de chaque station balnéaire.
      </footer>
    </div>
  );
}