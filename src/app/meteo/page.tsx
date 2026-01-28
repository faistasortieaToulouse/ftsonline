'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudRain, Thermometer, Sun, Wind, Droplets, TrendingUp, TrendingDown, Minus, Gauge } from 'lucide-react';

export default function MeteoPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/meteo')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return (
    <div className="bg-[#020617] h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-400 font-mono animate-pulse uppercase tracking-widest">Calcul du bilan comparatif...</p>
    </div>
  );

  const TrendIndicator = ({ value, unit, inverse = false }: { value: number, unit: string, inverse?: boolean }) => {
    const isPositive = value > 0;
    const isZero = value === 0;
    const colorClass = isZero ? "text-slate-500" : (isPositive ? (inverse ? "text-blue-400" : "text-red-400") : (inverse ? "text-red-400" : "text-blue-400"));

    return (
      <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${colorClass}`}>
        {isZero ? <Minus size={14} /> : (isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
        <span>{isPositive ? '+' : ''}{value}{unit} / 2025</span>
      </div>
    );
  };

  const chartData = data.history.time.map((date: string, i: number) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    temp: data.history.temperature_2m_mean[i],
    soleil: Math.round(data.history.sunshine_duration[i] / 3600)
  }));

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <header className="mb-12 max-w-6xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 italic">TOULOUSE<span className="text-blue-500">.METEO</span></h1>
            <p className="text-slate-500 font-mono uppercase text-sm tracking-widest">Analyse comparative 2026 vs 2025</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-slate-600 text-xs font-bold">COORDONNÉES</p>
            <p className="text-slate-400 font-mono text-xs">43.6043° N, 1.4437° E</p>
          </div>
        </div>
      </header>

      {/* Grille des statistiques - Changée en 5 colonnes sur desktop */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Température */}
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Thermometer className="text-red-400 mb-3" size={24} />
          <p className="text-slate-500 text-xs font-bold uppercase">Temp. Moyenne</p>
          <p className="text-3xl font-black">{data.stats.avgTemp}°C</p>
          <TrendIndicator value={parseFloat(data.stats.diffTemp)} unit="°C" />
        </div>

        {/* Pluie */}
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <CloudRain className="text-blue-400 mb-3" size={24} />
          <p className="text-slate-500 text-xs font-bold uppercase">Cumul Pluie</p>
          <p className="text-3xl font-black">{data.stats.totalRain}mm</p>
          <TrendIndicator value={parseFloat(data.stats.diffRain)} unit="mm" inverse={true} />
        </div>

        {/* NOUVEAU : Vent du Jour (Temps réel) */}
        <div className="bg-blue-600/20 p-5 rounded-3xl border border-blue-500/30 backdrop-blur-sm">
          <Gauge className="text-blue-400 mb-3" size={24} />
          <p className="text-blue-300 text-xs font-bold uppercase">Vent Actuel</p>
          <p className="text-3xl font-black text-white">{data.vitesseVent} <span className="text-sm">km/h</span></p>
          <p className="text-[10px] text-blue-400 mt-2 uppercase font-bold tracking-tighter">
            État : {data.condition === "Vent" ? "🌬️ Vent d'Autan" : "🕊️ Calme"}
          </p>
        </div>

        {/* Vent : Rafale Max (Record Annuel) */}
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Wind className="text-teal-400 mb-3" size={24} />
          <p className="text-slate-500 text-xs font-bold uppercase">Rafale Max</p>
          <p className="text-3xl font-black">{data.stats.maxWind} <span className="text-sm">km/h</span></p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase font-bold tracking-tighter">Record de l'année</p>
        </div>

        {/* Bilan Hydrique */}
        <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Droplets className="text-indigo-400 mb-3" size={24} />
          <p className="text-slate-500 text-xs font-bold uppercase">Bilan Hydrique</p>
          <p className={`text-3xl font-black ${parseFloat(data.stats.waterBalance) < 0 ? 'text-orange-400' : 'text-indigo-400'}`}>
            {data.stats.waterBalance}mm
          </p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase font-bold">Sol : {parseFloat(data.stats.waterBalance) < 0 ? 'Déficit' : 'Surplus'}</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="max-w-6xl mx-auto bg-slate-900/40 p-6 rounded-3xl border border-slate-800 h-[400px]">
        <h2 className="text-slate-300 font-bold flex items-center gap-2 uppercase text-sm tracking-widest mb-6">
          <Sun size={18} className="text-yellow-400" /> Ensoleillement cumulé : {data.stats.totalSunshine}h
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSun" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} unit="h" />
            <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff' }} />
            <Area type="monotone" dataKey="soleil" stroke="#fbbf24" strokeWidth={2} fill="url(#colorSun)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
