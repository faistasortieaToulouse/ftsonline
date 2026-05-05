"use client";

import { useEffect, useState } from "react";

// 1. Changement du nom du composant
export default function MeteoLezignanNewPage() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Appel de votre nouvelle API spécifique à Lézignan
    fetch("/api/meteolezignannew")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Rendu de vigilance (Cercle + Texte risque)
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

  // Rendu de l'icône de résumé
  const renderInfoSymbol = (alerte: string, risque: string) => {
    if (alerte === "Vert") return <span className="text-slate-300 text-[10px] font-bold uppercase">RAS</span>;

    const icons: any = {
      "Canicule": "🌡️",
      "Chaleur": "☀️",
      "Vent": "💨",
      "Tempête": "🌀",
      "Pluie": "🌧️",
      "Inondation": "🌊",
      "UV Critique": "🕶️",
      "UV Élevé": "🧴"
    };

    return <span className="text-lg" title={risque}>{icons[risque] || "⚠️"}</span>;
  };

  // Logique couleur UV
  const getUvColor = (uv: number) => {
    if (uv >= 8) return "text-purple-600 font-black";
    if (uv >= 6) return "text-red-500 font-bold";
    if (uv >= 3) return "text-amber-500 font-bold";
    return "text-green-500 font-medium";
  };

  if (error) return <div className="p-10 text-center text-red-500 font-bold">Erreur de chargement des prévisions pour Lézignan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center md:text-left">
          {/* 3. Mise à jour du titre principal */}
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Prévisions Lézignan-Corbières <span className="text-indigo-600">7 Jours</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm italic">
              Indicateurs de vigilance (Aude) & Rayonnement UV
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
                  <th className="p-4 text-center text-xs font-bold uppercase text-purple-600">UV</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Vent / Pluie</th>
                  <th className="p-4 text-center text-xs font-bold uppercase text-indigo-600">Vigilance</th>
                  <th className="p-4 text-center text-xs font-bold uppercase">Info</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((d, index) => (
                  <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-700 capitalize">
                      {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        d.ciel === "Soleil" ? "bg-amber-100 text-amber-700" : 
                        d.ciel === "Nuage" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700"
                      }`}>
                        {d.ciel}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-red-600">{d.tempMax.toFixed(1)}°</td>
                    <td className="p-4 text-center font-bold text-blue-600">{d.tempMin.toFixed(1)}°</td>
                    <td className={`p-4 text-center text-sm ${getUvColor(d.uv)}`}>
                      {d.uv.toFixed(1)}
                    </td>
                    <td className="p-4 text-center text-[11px] leading-tight">
                      <div className="font-bold text-slate-700">{d.vent.toFixed(0)} <span className="font-normal text-slate-400">km/h</span></div>
                      <div className="text-blue-500 font-bold">{d.pluie.toFixed(1)} mm</div>
                    </td>
                    <td className="p-4 text-center border-l border-slate-50">
                      {renderVigilance(d.alerte, d.risque)}
                    </td>
                    <td className="p-4 text-center">
                      {renderInfoSymbol(d.alerte, d.risque)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {loading && (
          <div className="mt-20 text-center animate-pulse">
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Analyse locale de Lézignan en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
