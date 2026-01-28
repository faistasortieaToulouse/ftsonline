'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function ConstellationPage() {
  const [data, setData] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [view, setView] = useState<'Nord' | 'Sud'>('Nord');

  useEffect(() => {
    fetch(`/api/constellation?month=${month}`)
      .then(res => res.json())
      .then(setData);
  }, [month]);

  const project = (ra: number, dec: number) => {
    const angle = (ra / 24) * 2 * Math.PI - Math.PI / 2;
    
    let r;
    if (view === 'Nord') {
      // Nord : Le bord du cercle est l'équateur (0°), le centre est +90°
      r = (90 - dec) * 5.5; 
    } else {
      // Sud : Le bord du cercle est l'équateur (0°), le centre est -90°
      r = (dec + 90) * 5.5;
    }
    
    return { 
      x: 500 + r * Math.cos(angle), 
      y: 500 + r * Math.sin(angle) 
    };
  };

  if (!data) return (
    <div className="bg-[#020617] min-h-screen text-white flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse tracking-widest text-blue-400">CARTOGRAPHIE CÉLESTE...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 max-w-6xl mx-auto">
        <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all font-medium">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'Accueil
        </Link>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                <button 
                  onClick={() => setView('Nord')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'Nord' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  HEMISPHERE NORD
                </button>
                <button 
                  onClick={() => setView('Sud')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'Sud' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  HEMISPHERE SUD
                </button>
            </div>
            
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))} 
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2 text-blue-400 font-bold outline-none cursor-pointer"
            >
              {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m, i) => (
                  <option key={i} value={i} className="bg-[#020617]">{m}</option>
              ))}
            </select>
        </div>
      </header>

      <div className="flex justify-center items-center">
        <div className="relative w-full max-w-[850px] aspect-square rounded-full border border-blue-500/20 bg-[#030712] overflow-hidden shadow-[0_0_150px_rgba(30,58,138,0.3)]">
          
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            {/* Grilles de repère - L'anneau extérieur représente l'Équateur (0°) */}
            <circle cx="500" cy="500" r="495" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.1" />
            <circle cx="500" cy="500" r="247" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
            
            {/* 1. LIGNES DES CONSTELLATIONS */}
            {data.lines.map((con: any, i: number) => (
              <g key={i}>
                {con.paths.map((path: any, j: number) => {
                    // FILTRE STRICT : On vérifie que la ligne appartient à l'hémisphère choisi
                    const isVisible = path.every((p: any) => view === 'Nord' ? p[1] >= 0 : p[1] <= 0);
                    if (!isVisible) return null;
                    
                    return (
                        <polyline
                            key={j}
                            points={path.map((p: any) => {
                                const {x, y} = project(p[0], p[1]);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#fde047" 
                            strokeWidth="1.5"
                            opacity="0.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    );
                })}
              </g>
            ))}

            {/* 2. ÉTOILES */}
            {data.stars.map((star: any, i: number) => {
              // FILTRE STRICT : Nord = Dec > 0, Sud = Dec < 0
              if (view === 'Nord' && star.dec < 0) return null;
              if (view === 'Sud' && star.dec > 0) return null;
              
              const { x, y } = project(star.ra, star.dec);
              const size = Math.max(0.8, (6 - star.mag) * 0.9);
              
              return (
                <circle 
                  key={i} 
                  cx={x} cy={y} 
                  r={size} 
                  fill={star.visible ? "white" : "#1e293b"} 
                  opacity={star.visible ? 1 : 0.2} 
                  className={star.visible && star.mag < 1.2 ? "animate-pulse" : ""}
                />
              );
            })}

            {/* 3. NOMS DES CONSTELLATIONS */}
            {data.names.map((n: any, i: number) => {
                // FILTRE STRICT
                const isVisible = view === 'Nord' ? n.dec >= 0 : n.dec <= 0;
                if (!isVisible) return null;

                const { x, y } = project(n.ra, n.dec);
                return (
                    <text 
                      key={i} 
                      x={x} y={y} 
                      fontSize="10" 
                      fill="#94a3b8" 
                      opacity="0.7" 
                      textAnchor="middle" 
                      className="pointer-events-none select-none uppercase font-bold tracking-tighter"
                    >
                        {n.name}
                    </text>
                );
            })}
          </svg>

          {/* Indicateur de centre (Pôle) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_white]"></div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <p className="text-slate-500 text-sm font-mono tracking-widest uppercase">
          — Pôle Céleste {view === 'Nord' ? 'Nord (+90°)' : 'Sud (-90°)'} —
        </p>
      </div>
    </div>
  );
}
