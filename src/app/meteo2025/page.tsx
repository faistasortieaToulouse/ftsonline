"use client";

import { useEffect, useState } from "react";

type Meteo = {
  date: string;
  tempMax: number;
  tempMin: number;
  pluie: number;
  vent: number;
  ciel: string;
  uvIndex: number | null;
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  // Libellés UV avec couleurs dynamiques
  const getUvInfo = (val: number | null | undefined) => {
    const v = Number(val || 0);
    if (v <= 2) return { label: "Faible", color: "text-green-600" };
    if (v <= 5) return { label: "Modéré", color: "text-amber-500" };
    if (v <= 7) return { label: "Élevé", color: "text-orange-600" };
    return { label: "Très élevé", color: "text-red-600" };
  };

  // Formatage de la date pour le français
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Météo Toulouse <span className="text-indigo-600">2025</span>
            </h1>
            <p className="text-slate-500 mt-1 italic">Archives et simulations UV consolidées</p>
          </div>
          <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            {data.length} jours enregistrés
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500">
                  <th className="p-5 text-left text-xs font-bold uppercase tracking-widest">Date</th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-widest">Ciel</th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-widest text-red-500">Temp. Max</th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-widest text-blue-500">Temp. Min</th>
                  <th className="p-5 text-center text-xs font-bold uppercase tracking-widest text-indigo-600">Indice UV</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((d, index) => {
                  const uv = getUvInfo(d.uvIndex);
                  
                  return (
                    <tr key={d.date || index} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-5 text-sm font-medium text-slate-600 whitespace-nowrap uppercase">
                        {formatDate(d.date)}
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          d.ciel === "Soleil" ? "bg-amber-100 text-amber-700" : 
                          d.ciel === "Nuage" ? "bg-slate-100 text-slate-500" : 
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {d.ciel}
                        </span>
                      </td>
                      <td className="p-5 text-center font-bold text-slate-800 text-lg">
                        {d.tempMax?.toFixed(1) ?? '--'}°
                      </td>
                      <td className="p-5 text-center font-bold text-slate-400 text-lg">
                        {d.tempMin?.toFixed(1) ?? '--'}°
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-sm font-black uppercase ${uv.color}`}>
                            {uv.label}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px] bg-slate-50 px-1.5 rounded border border-slate-100">
                            {Number(d.uvIndex || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
              Chargement des archives 2025...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
