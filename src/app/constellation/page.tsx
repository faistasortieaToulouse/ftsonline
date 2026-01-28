'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoonStars } from 'lucide-react';

export default function ConstellationPage() {
  const [stars, setStars] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [view, setView] = useState<'Nord' | 'Sud'>('Nord');

  useEffect(() => {
    fetch(`/api/constellation?month=${month}`)
      .then(res => res.json())
      .then(setStars);
  }, [month]);

  // Projection mathématique des coordonnées Dec/RA en pixels X/Y
  const project = (ra: number, dec: number) => {
    const angle = (ra / 24) * 2 * Math.PI;
    // Pour le Nord, le centre est Dec=90. Pour le Sud, Dec=-90.
    const r = view === 'Nord' ? (90 - dec) * 2.5 : (90 + dec) * 2.5;
    const x = 250 + r * Math.cos(angle);
    const y = 250 + r * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <Link href="/" className="text-blue-400 flex items-center gap-2 hover:underline">
          <ArrowLeft size={18} /> Accueil
        </Link>
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button onClick={() => setView('Nord')} className={`px-4 py-1 rounded ${view === 'Nord' ? 'bg-blue-600' : ''}`}>Nord</button>
          <button onClick={() => setView('Sud')} className={`px-4 py-1 rounded ${view === 'Sud' ? 'bg-blue-600' : ''}`}>Sud</button>
        </div>
        <select 
          value={month} 
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="bg-slate-800 border-none rounded-lg text-sm"
        >
          {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
      </header>

      <div className="flex justify-center relative">
        <div className="w-[500px] h-[500px] rounded-full border border-blue-900/50 bg-[radial-gradient(circle_at_center,_#0f172a_0%,_#020617_100%)] relative overflow-hidden shadow-[0_0_100px_rgba(30,64,175,0.3)]">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            {stars.map((star: any, i: number) => {
              // On ne projette que les étoiles de l'hémisphère choisi
              if ((view === 'Nord' && star.dec < -10) || (view === 'Sud' && star.dec > 10)) return null;
              
              const { x, y } = project(star.ra, star.dec);
              const size = Math.max(0.5, (6 - star.mag) * 0.8);
              
              return (
                <circle 
                  key={i} 
                  cx={x} cy={y} r={size} 
                  fill={star.visible ? "white" : "#1e293b"}
                  className={star.visible ? "animate-pulse" : ""}
                  opacity={star.visible ? 1 : 0.3}
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      <p className="text-center mt-6 text-slate-500 text-sm italic">
        Affichage des étoiles de magnitude &lt; 6.0 à minuit. Les points brillants sont visibles ce mois-ci.
      </p>
    </div>
  );
}
