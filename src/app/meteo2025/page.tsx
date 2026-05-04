"use client";
import { useEffect, useState } from "react";

export default function Meteo2025Page() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/meteo2025")
      .then(res => res.json())
      .then(json => { if (Array.isArray(json)) setData(json); })
      .catch(err => console.error("Erreur:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Météo Toulouse <span className="text-indigo-600">2025</span>
          </h1>
          <p className="text-slate-500 mt-2 italic">Données historiques et Vigilance</p>
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
                  <tr key={index} className="hover:bg-indigo-50/40 transition-colors text-sm">
                    <td className="p-4 font-semibold text-slate-700">{d.date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        d.ciel === "Soleil" ? "bg-amber-100 text-amber-700" : 
                        d.ciel === "Nuage" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"
                      }`}>
                        {d.ciel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{d.tempMax}°C</td>
                    <td className="p-4 text-center font-bold text-blue-600">{d.tempMin}°C</td>
                    <td className="p-4 text-center font-medium text-slate-600">{d.vent} <small>km/h</small></td>
                    <td className="p-4 text-center">
                      <div className={`w-3 h-3 mx-auto rounded-full shadow-sm ${
                        d.alerte === "Orange" ? "bg-orange-500" : 
                        d.alerte === "Jaune" ? "bg-yellow-400" : "bg-green-400"
                      }`} title={d.alerte}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && (
          <div className="mt-20 text-center text-slate-500 animate-pulse font-bold">
            ANALYSE DES DONNÉES 2025 EN COURS...
          </div>
        )}
      </div>
    </div>
  );
}
