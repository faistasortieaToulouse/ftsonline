"use client";

import { useEffect, useState } from "react";

export default function MeteoNewPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meteonew")
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const renderVigilance = (alerte: string, risque: string) => {
    const config: any = {
      "Vert": { color: "bg-green-500", text: "V" },
      "Jaune": { color: "bg-yellow-400", text: "J" },
      "Orange": { color: "bg-orange-500", text: "O" }
    };
    const s = config[alerte] || config["Vert"];
    return (
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${s.color}`}>
          {s.text}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">{risque || "RAS"}</span>
      </div>
    );
  };

  const getUvColor = (uv: number) => {
    if (uv >= 8) return "text-purple-600 font-black";
    if (uv >= 6) return "text-red-500 font-bold";
    if (uv >= 3) return "text-amber-500 font-bold";
    return "text-green-500 font-medium";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Prévisions <span className="text-indigo-600">7 jours</span>
          </h1>
          <p className="text-slate-500 italic">Toulouse • Prochains jours</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-4 text-left">Date</th>
                <th className="p-4">Ciel</th>
                <th className="p-4">Temp.</th>
                <th className="p-4 text-purple-600">UV</th>
                <th className="p-4 text-blue-500">Pluie / Vent</th>
                <th className="p-4">Vigilance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-left font-bold text-slate-700 text-sm">
                    {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-md font-bold">{d.ciel}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-red-500">{d.tempMax}°</div>
                    <div className="text-[10px] text-blue-400">{d.tempMin}°</div>
                  </td>
                  <td className={`p-4 text-sm ${getUvColor(d.uv)}`}>
                    {d.uv.toFixed(1)}
                  </td>
                  <td className="p-4 text-[11px]">
                    <div className="text-blue-600 font-bold">{d.pluie} mm</div>
                    <div className="text-slate-400">{d.vent} km/h</div>
                  </td>
                  <td className="p-4">
                    {renderVigilance(d.alerte, d.risque)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="mt-10 text-center animate-pulse font-bold text-indigo-600">Calcul des prévisions...</div>}
      </div>
    </div>
  );
}
