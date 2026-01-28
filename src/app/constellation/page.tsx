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
    // Rotation pour que le RA 0 soit en haut
    const angle = (ra / 24) * 2 * Math.PI - Math.PI / 2;
    
    let r;
    if (view === 'Nord') {
      // Centre = Pôle Nord (+90°). On s'éloigne du centre quand Dec diminue.
      r = (90 - dec) * 5.2; 
    } else {
      // Centre = Pôle Sud (-90°). On s'éloigne du centre quand Dec augmente.
      r = (dec + 90) * 5.2;
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
          Retour au tableau de bord
        </Link>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Double Bouton Nord / Sud */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-sm">
                <button 
                  onClick={() => setView('Nord')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'Nord' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  CIEL NORD
                </button>
                <button 
                  onClick={() => setView('Sud')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${view === 'Sud' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  CIEL SUD
                </button>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Mois</span>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(parseInt(e.target.value))} 
                  className="bg-transparent border-none text-blue-400 font-bold outline-none cursor-pointer"
                >
                  {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m, i) => (
                      <option key={i} value={i} className="bg-[#020617]">{m}</option>
                  ))}
                </select>
            </div>
        </div>
      </header>

      <div className="flex justify-center items-center">
        <div className="relative w-full max-w-[850px] aspect-square rounded-full border border-white/5 bg-[#030712] overflow-hidden shadow-[0_0_150px_rgba(30,58,138,0.3)]">
          {/* Boussole flottante */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-slate-700 font-black text-xl tracking-[1em] pointer-events-none opacity-20">NORD</div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-700 font-black text-xl tracking-[1em] pointer-events-none opacity-20">SUD</div>

          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            {/* Grilles de repère (Méridiens et Parallèles) */}
            <circle cx="500" cy="500" r="495" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
            <circle cx="500" cy="500" r="330" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
            <circle cx="500" cy="500" r="165" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
            <line x1="500" y1="0" x2="500" y2="1000" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />
            <line x1="0" y1="500" x2="1000" y2="500" stroke="#ffffff" strokeWidth="0.5" opacity="0.05" />

            {/* 1. LIGNES DES CONSTELLATIONS (JAUNE VIF) */}
            {data.lines.map((con: any, i: number) => (
              <g key={i}>
                {con.paths.map((path: any, j: number) => {
                    const isVisible = path.some((p: any) => view === 'Nord' ? p[1] > -25 : p[1] < 25);
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
                            strokeWidth="1.8"
                            opacity="0.6"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    );
                })}
              </g>
            ))}

            {/* 2. ÉTOILES */}
            {data.stars.map((star: any, i: number) => {
              if (view === 'Nord' && star.dec < -20) return null;
              if (view === 'Sud' && star.dec > 20) return null;
              
              const { x, y } = project(star.ra, star.dec);
              const size = Math.max(0.8, (6 - star.mag) * 0.9);
              
              return (
                <circle 
                  key={i} 
                  cx={x} cy={y} 
                  r={size} 
                  fill={star.visible ? "white" : "#1e293b"} 
                  opacity={star.visible ? 1 : 0.2} 
                  className={star.visible && star.mag < 1 ? "animate-pulse" : ""}
                />
              );
            })}

            {/* 3. NOMS DES CONSTELLATIONS */}
            {data.names.map((n: any, i: number) => {
                const isVisible = view === 'Nord' ? n.dec > -10 : n.dec < 10;
                if (!isVisible) return null;

                const { x, y } = project(n.ra, n.dec);
                return (
                    <text 
                      key={i} 
                      x={x} y={y} 
                      fontSize="9" 
                      fill="#94a3b8" 
                      opacity="0.6" 
                      textAnchor="middle" 
                      className="pointer-events-none select-none uppercase font-bold tracking-widest"
                    >
                        {n.name}
                    </text>
                );
            })}
          </svg>
        </div>
      </div>
      
      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-2xl max-w-lg">
            <Compass className="text-blue-500" size={24} />
            <p className="text-sm text-slate-400">
                Vous visualisez actuellement le ciel de **minuit** pour l'hémisphère **{view.toUpperCase()}**. 
                Les points les plus brillants sont les étoiles majeures visibles ce mois-ci.
            </p>
        </div>
      </div>
    </div>
  );
}
