"use client";

import { useEffect, useState } from "react";

export default function Meteo2025Page() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/meteo2025")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setData(json);
      })
      .catch(() => setError(true));
  }, []);

  // Ton rendu de vigilance que tu souhaites conserver
  const renderVigilance = (alerte: string, risque: string) => {
    const config: any = {
      "Vert": { color: "bg-green-500", text: "V", textCol: "text-white" },
      "Jaune": { color: "bg-yellow-400", text: "J", textCol: "text-yellow-900" },
      "Orange": { color: "bg-orange-500", text: "O", textCol: "text-white" },
      "Rouge": { color: "bg-red-600", text: "R", textCol: "text-white" }
    };
    
    const s = config[alerte] || config["Vert"];
    
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm border border-black/5 ${s.color} ${s.textCol}`}>
          {s.text}
        </div>
        {alerte !== "Vert" && risque && (
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter leading-none">
            {risque}
          </span>
        )}
      </div>
    );
  };

  // Nouvelle fonction pour le symbole récapitulatif
  const renderInfoSymbol = (alerte: string, risque: string) => {
    if (alerte === "Vert") return <span className="text-slate-300 text-[10px] font-bold uppercase">RAS</span>;

    const icons: any = {
      "Canicule": "🌡️",
      "Chaleur": "☀️",
      "Vent": "💨",
      "Tempête": "🌀",
      "Pluie": "🌧️",
      "Inondation": "🌊"
    };

    return <span className="text-lg" title={risque}>{icons[risque] || "⚠️"}</span>;
  };

  if (error) return <div className="p-10 text-center text-red-500 font-bold">Erreur de chargement.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Météo Toulouse <span className="text-indigo-600">2025</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm italic">
             Données consolidées & Indicateurs de risques
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="p-4 text-left text-xs font-bold uppercase">Date</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Ciel</th>
                  <th className="p-4 text-center text-xs font-bold uppercase text-red-500">Max</th>
                  <th className="p-4 text-center text-xs font-bold uppercase text-blue-500">Min</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Vent</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Pluie</th>
                  <th className="p-4 text-center text-xs font-bold uppercase text-indigo-600">Vigilance</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Info</th>
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
                    <td className="p-4 text-center font-bold text-red-600">{d.tempMax.toFixed(1)}°C</td>
                    <td className="p-4 text-center font-bold text-blue-600">{d.tempMin.toFixed(1)}°C</td>
                    <td className="p-4 text-center text-sm font-medium">{d.vent.toFixed(0)} <span className="text-[10px] text-slate-400 font-normal">km/h</span></td>
                    <td className="p-4 text-center text-sm font-medium">
                        {d.pluie > 0 ? (
                            <span className="text-blue-600 font-bold">{d.pluie.toFixed(1)} mm</span>
                        ) : (
                            <span className="text-slate-300 italic">0.0 mm</span>
                        )}
                    </td>
                    <td className="p-4 text-center">
                      {renderVigilance(d.alerte, d.risque)}
                    </td>
                    {/* La nouvelle colonne avec le symbole dédié */}
                    <td className="p-4 text-center">
                      {renderInfoSymbol(d.alerte, d.risque)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && (
          <div className="mt-20 text-center animate-pulse">
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Chargement 2025...</p>
          </div>
        )}
      </div>
    </div>
  );
}
