"use client";

import { useEffect, useState } from "react";

// Mise à jour du type pour inclure l'objet alerte calculé par l'API
type Meteo = {
  date: string;
  tempMax: number;
  tempMin: number;
  pluie: number;
  vent: number;
  ciel: string;
  uvIndex: number | null;
  alerte: {
    niveau: string; // Vert, Jaune, Orange, Rouge
    libelle: string; // Calme, Canicule, Vent fort, etc.
  };
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  // Gestion des styles CSS pour les badges de vigilance
  const getAlerteStyle = (niveau: string) => {
    switch (niveau) {
      case "Rouge": return "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200";
      case "Orange": return "bg-orange-500 text-white";
      case "Jaune": return "bg-yellow-400 text-yellow-900";
      default: return "bg-green-100 text-green-700 opacity-60";
    }
  };

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) setData(json);
      })
      .catch((err) => console.error("Erreur fetch meteo:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Météo & Vigilance <span className="text-indigo-600">2025</span>
            </h1>
            <p className="text-slate-500 mt-2 italic">Toulouse : Archives et alertes calculées</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm">
            <span className="font-bold text-indigo-600">{data.length}</span> jours analysés
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-center">Vigilance</th>
                  <th className="p-4 text-center">Températures</th>
                  <th className="p-4 text-center">Vent</th>
                  <th className="p-4 text-center">Précipitations</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {data.map((d, index) => (
                  <tr key={d.date || index} className="hover:bg-slate-50/80 transition-colors">
                    {/* DATE */}
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                      {new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>

                    {/* VIGILANCE (ALERTE) */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getAlerteStyle(d.alerte.niveau)}`}>
                        {d.alerte.niveau !== "Vert" ? d.alerte.libelle : "RAS"}
                      </span>
                    </td>

                    {/* TEMPERATURES */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="font-bold text-red-600">{d.tempMax}°</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-bold text-blue-600">{d.tempMin}°</span>
                    </td>

                    {/* VENT */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-700">{d.vent} <small className="text-[10px] text-slate-400 font-normal">km/h</small></span>
                      </div>
                    </td>

                    {/* PLUIE */}
                    <td className="p-4 text-center">
                      <span className={`${d.pluie > 0 ? "text-blue-600 font-bold" : "text-slate-300"}`}>
                        {d.pluie > 0 ? `${d.pluie} mm` : '--'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOADING STATE */}
        {data.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Analyse des données météo 2025...</p>
          </div>
        )}
      </div>
    </div>
  );
}
