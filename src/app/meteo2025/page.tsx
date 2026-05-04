"use client";

import { useEffect, useState } from "react";

export default function Meteo2025Page() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur 404 ou 500");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setData(json);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Erreur : La route /api/meteo2025 est introuvable (404). <br />
        Vérifiez le nom du dossier dans src/app/api/
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Météo Toulouse <span className="text-indigo-600">2025</span>
          </h1>
          <p className="text-slate-500 mt-2 italic text-sm">Basé sur archive-api & models=best_match</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Ciel</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-red-500">Max</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider text-blue-500">Min</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Vent</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Vigilance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((d, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700">{d.date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        d.ciel === "Soleil" ? "bg-amber-100 text-amber-700" : 
                        d.ciel === "Nuage" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"
                      }`}>
                        {d.ciel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{d.tempMax}°C</td>
                    <td className="p-4 text-center font-bold text-blue-600">{d.tempMin}°C</td>
                    <td className="p-4 text-center text-sm">{d.vent} km/h</td>
                    <td className="p-4 text-center">
                      <div className={`w-3 h-3 mx-auto rounded-full border border-black/10 ${
                        d.alerte === "Orange" ? "bg-orange-500" : 
                        d.alerte === "Jaune" ? "bg-yellow-400" : "bg-green-400"
                      }`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && (
          <div className="mt-20 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium italic">Analyse des données météo 2025...</p>
          </div>
        )}
      </div>
    </div>
  );
}
