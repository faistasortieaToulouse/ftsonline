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
  uvIndex: number | null; // Changement ici : peut être null
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  // --- LOGIQUE DE LIBELLÉ UV SÉCURISÉE ---
  const getUvLabel = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    if (val <= 2) return "Faible";
    if (val <= 5) return "Modéré";
    if (val <= 7) return "Élevé";
    return "Très élevé";
  };

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => res.json())
      .then((json) => {
        // On vérifie que json est bien un tableau avant de set
        if (Array.isArray(json)) setData(json);
      })
      .catch((err) => console.error("Erreur fetch meteo:", err));
  }, []);

  return (
    <div className="p-5 font-sans text-slate-900">
      <h1 className="text-2xl font-bold mb-6">Météo Toulouse 2025</h1>

      <div className="overflow-x-auto shadow-sm border border-slate-200 rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-slate-200 p-3 text-left">Date</th>
              <th className="border-b border-slate-200 p-3 text-center">Temp Max</th>
              <th className="border-b border-slate-200 p-3 text-center">Temp Min</th>
              <th className="border-b border-slate-200 p-3 text-center">Pluie</th>
              <th className="border-b border-slate-200 p-3 text-center">Vent</th>
              <th className="border-b border-slate-200 p-3 text-left">Ciel</th>
              <th className="border-b border-slate-200 p-3 text-center">Nuages</th>
              <th className="border-b border-slate-200 p-3 text-center">Indice UV</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((d) => (
              <tr key={d.date} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-3 text-sm font-medium">{d.date}</td>
                <td className="p-3 text-center font-bold text-red-600">{d.tempMax ?? '--'}°C</td>
                <td className="p-3 text-center font-bold text-blue-600">{d.tempMin ?? '--'}°C</td>
                <td className="p-3 text-center text-slate-600">{d.pluie ?? 0} mm</td>
                <td className="p-3 text-center text-slate-600">{d.vent ?? 0} km/h</td>
                <td className="p-3 text-sm text-slate-700">{d.ciel || "Non renseigné"}</td>
                <td className="p-3 text-center text-slate-500">{d.nuages ?? 0}%</td>
                <td className="p-3 text-center">
                  {d.uvIndex !== null && d.uvIndex !== undefined ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
                      <span className="font-bold text-indigo-700">
                        {getUvLabel(d.uvIndex)}
                      </span>
                      <span className="text-slate-400 text-xs">
                        ({Number(d.uvIndex).toFixed(1)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 italic">--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="mt-8 flex flex-col items-center gap-2">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
           <p className="text-slate-500 italic">Récupération des données...</p>
        </div>
      )}
    </div>
  );
}
