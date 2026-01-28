'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CloudRain, Thermometer, Calendar } from 'lucide-react';

export default function MeteoPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/meteo')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-20 text-center text-blue-400 animate-pulse">ANALYSE DU CLIMAT TOULOUSAIN...</div>;

  // Formater les données pour le graphique
  const chartData = data.history.time.map((date: string, i: number) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    temp: data.history.temperature_2m_mean[i],
    pluie: data.history.precipitation_sum[i]
  }));

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Calendar className="text-blue-500" /> Bilan Toulouse {new Date().getFullYear()}
      </h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-900/30 flex items-center gap-4">
          <div className="p-4 bg-orange-500/20 rounded-full text-orange-500"><Thermometer size={32} /></div>
          <div>
            <p className="text-slate-400 text-sm">Température Moyenne</p>
            <p className="text-3xl font-bold">{data.stats.avgTemp}°C</p>
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-900/30 flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-full text-blue-500"><CloudRain size={32} /></div>
          <div>
            <p className="text-slate-400 text-sm">Cumul de Pluie</p>
            <p className="text-3xl font-bold">{data.stats.totalRain} mm</p>
          </div>
        </div>
      </div>

      {/* Graphique de l'année */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-[400px]">
        <h2 className="mb-6 text-slate-400 font-medium">Évolution quotidienne (Température et Précipitations)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} unit="°C" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} unit="mm" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Temp. moyenne" />
            <Line yAxisId="right" type="step" dataKey="pluie" stroke="#3b82f6" strokeWidth={2} dot={false} name="Pluie" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
