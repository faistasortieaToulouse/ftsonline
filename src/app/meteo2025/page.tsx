"use client";

import { useEffect, useState } from "react";

type Meteo = {
  date: string;
  tempMax: number;
  tempMin: number;
  pluie: number;
  vent: number;
  ciel: string;
  nuages: number;
  uvIndex: number | null;
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  // Libellés UV basés sur les standards de l'OMS
  const getUvLabel = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    const v = Number(val);
    if (v <= 2) return "Faible";
    if (v <= 5) return "Modéré";
    if (v <= 7) return "Élevé";
    return "Très élevé";
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
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Météo Toulouse <span className="text-indigo-600">2025</span>
          </h1>
          <p className="text-slate-500 mt-2">Historique et prévisions basés sur Open-Meteo Archive</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Ciel</th>
                  <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider text-red-500">Max</th>
                  <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider text-blue-500">Min</th>
                  <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Pluie</th>
                  <th className="p-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider text-indigo-500">Indice UV</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((d) => (
                  <tr key={d.date} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="p-4 text-sm font-semibold text-slate-700 whitespace-nowrap">{d.date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        d.ciel === "Soleil" ? "bg-amber-100 text-amber-700" : 
                        d.ciel === "Nuage" ? "bg-slate-100 text-slate-600" : 
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {d.ciel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{d.tempMax ?? '--'}°C</td>
                    <td className="p-4 text-center font-bold text-blue-600">{d.tempMin ?? '--'}°C</td>
                    <td className="p-4 text-center text-sm text-slate-500">{d.pluie ?? 0} <span className="text-xs">mm</span></td>
                    <td className="p-4 text-center">
                      {d.uvIndex !== null && d.uvIndex !== undefined ? (
                        <div className="inline-flex flex-col items-center leading-tight">
                          <span className="text-sm font-bold text-indigo-700">
                            {getUvLabel(d.uvIndex)}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({Number(d.uvIndex).toFixed(1)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-xs">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500 font-medium animate-pulse">Analyse des données météo en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
