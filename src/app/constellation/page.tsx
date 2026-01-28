'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
      // Pour le Nord, le centre est +90°, on s'éloigne quand dec diminue
      r = (90 - dec) * 5.5; 
    } else {
      // Pour le Sud, le centre est -90°, on s'éloigne quand dec augmente
      r = (dec + 90) * 5.5;
    }
    
    return { 
      x: 500 + r * Math.cos(angle), 
      y: 500 + r * Math.sin(angle) 
    };
  };

  if (!data) return (
    <div className="bg-[#020617] min-h-screen text-white flex items-center justify-center font-mono">
      <div className="animate-pulse">CHARGEMENT DU CIEL...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowLeft size={20}/> Retour
        </Link>
        
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setView(view === 'Nord' ? 'Sud' : 'Nord')} 
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              VOIR CIEL {view === 'Nord' ? 'SUD' : 'NORD'}
            </button>
            
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))} 
              className="bg-slate-800 border-none rounded-lg px-4 py-2 text-blue-400 font-bold outline-none"
            >
              {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
              ))}
            </select>
        </div>
      </header>

      <div className="flex justify-center items-center">
        <div className="relative w-full max-w-[850px] aspect-square rounded-full border border-blue-900/40 bg-[#030712] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            {/* Grilles de repère */}
            <circle cx="500" cy="500" r="495" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
            <circle cx="500" cy="500" r="250" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />

            {/* 1. LIGNES DES CONSTELLATIONS */}
            {data.lines.map((con: any, i: number) => (
              <g key={i}>
                {con.paths.map((path: any, j: number) => {
                    // Filtrage des lignes : on accepte un débordement de 20° sur l'équateur
                    const isVisible = path.some((p: any) => view === 'Nord' ? p[1] > -20 : p[1] < 20);
                    if (!isVisible) return null;
                    
                    return (
                        <polyline
                            key={j}
                            points={path.map((p: any) => {
                                const {x, y} = project(p[0], p[1]);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.2"
                            opacity="0.3"
                        />
                    );
                })}
              </g>
            ))}

            {/* 2. ÉTOILES */}
            {data.stars.map((star: any, i: number) => {
              // Filtrage des étoiles selon l'hémisphère
              if (view === 'Nord' && star.dec < -20) return null;
              if (view === 'Sud' && star.dec > 20) return null;
              
              const { x, y } = project(star.ra, star.dec);
              const size = Math.max(0.7, (6 - star.mag) * 0.9);
              
              return (
                <circle 
                  key={i} 
                  cx={x} cy={y} 
                  r={size} 
                  fill={star.visible ? "white" : "#1e293b"} 
                  opacity={star.visible ? 1 : 0.3} 
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
                      fill="#60a5fa" 
                      opacity="0.5" 
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
      
      <footer className="mt-8 text-center text-slate-500 text-sm italic">
        Vue centrée sur le pôle céleste {view === 'Nord' ? 'Nord' : 'Sud'}. Les étoiles brillantes sont visibles à minuit.
      </footer>
    </div>
  );
}
