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
  uvIndex: number;
};

export default function Meteo2025Page() {
  const [data, setData] = useState<Meteo[]>([]);

  // --- LOGIQUE DE LIBELLÉ UV ---
  // On reprend exactement la logique que tu utilises ailleurs
  const getUvLabel = (val: number) => {
    if (val <= 2) return "Faible";
    if (val <= 5) return "Modéré";
    if (val <= 7) return "Élevé";
    return "Très élevé";
  };

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Erreur fetch meteo:", err));
  }, []);

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-6">Météo Toulouse 2025</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-300 p-2">Date</th>
              <th className="border border-slate-300 p-2">Temp Max</th>
              <th className="border border-slate-300 p-2">Temp Min</th>
              <th className="border border-slate-300 p-2">Pluie</th>
              <th className="border border-slate-300 p-2">Vent</th>
              <th className="border border-slate-300 p-2">Ciel</th>
              <th className="border border-slate-300 p-2">Nuages</th>
              <th className="border border-slate-300 p-2">Indice UV</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-300 p-2 text-center">{d.date}</td>
                <td className="border border-slate-300 p-2 text-center font-semibold text-red-600">{d.tempMax}°C</td>
                <td className="border border-slate-300 p-2 text-center text-blue-600">{d.tempMin}°C</td>
                <td className="border border-slate-300 p-2 text-center">{d.pluie} mm</td>
                <td className="border border-slate-300 p-2 text-center">{d.vent} km/h</td>
                <td className="border border-slate-300 p-2">{d.ciel}</td>
                <td className="border border-slate-300 p-2 text-center">{d.nuages}%</td>
                <td className="border border-slate-300 p-2 text-center">
                  <span className="font-bold text-indigo-700">
                    {getUvLabel(d.uvIndex)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">
                    ({d.uvIndex.toFixed(1)})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <p className="mt-4 text-gray-500 italic">Chargement des données météorologiques...</p>
      )}
    </div>
  );
}
