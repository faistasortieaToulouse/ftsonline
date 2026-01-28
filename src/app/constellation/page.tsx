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
    const angle = (ra / 24) * 2 * Math.PI - Math.PI / 2;
    // Rayon : 90-dec pour le nord, 90+dec pour le sud. Multiplié par 5 pour un cercle de 500px de rayon.
    const r = view === 'Nord' ? (90 - dec) * 5 : (90 + dec) * 5;
    return { x: 500 + r * Math.cos(angle), y: 500 + r * Math.sin(angle) };
  };

  if (!data) return <div className="bg-[#020617] min-h-screen text-white flex items-center justify-center">Chargement du ciel...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4">
      <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-400"><ArrowLeft size={20}/> Retour</Link>
        <div className="flex gap-4">
            <button onClick={() => setView(view === 'Nord' ? 'Sud' : 'Nord')} className="bg-blue-600 px-4 py-1 rounded">
                Vue {view === 'Nord' ? 'Sud' : 'Nord'}
            </button>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-slate-800 rounded px-2">
                {["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                ))}
            </select>
        </div>
      </header>

      <div className="flex justify-center">
        <div className="relative w-full max-w-[800px] aspect-square rounded-full border border-blue-900/30 bg-[#030712] overflow-hidden">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            {/* 1. DESSIN DES LIGNES DES CONSTELLATIONS */}
            {data.lines.map((con: any, i: number) => (
              <g key={i}>
                {con.paths.map((path: any, j: number) => {
                    // On ne dessine que si au moins un point est dans l'hémisphère visible
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
                            strokeWidth="1"
                            opacity="0.25"
                        />
                    );
                })}
              </g>
            ))}

            {/* 2. DESSIN DES ÉTOILES */}
            {data.stars.map((star: any, i: number) => {
              if (view === 'Nord' && star.dec < -15) return null;
              if (view === 'Sud' && star.dec > 15) return null;
              
              const { x, y } = project(star.ra, star.dec);
              const size = Math.max(0.6, (6 - star.mag) * 0.8);
              
              return (
                <circle key={i} cx={x} cy={y} r={size} fill={star.visible ? "white" : "#1e293b"} opacity={star.visible ? 1 : 0.3} />
              );
            })}

            {/* 3. DESSIN DES NOMS DES CONSTELLATIONS */}
            {data.names.map((n: any, i: number) => {
                if (view === 'Nord' && n.dec < 0) return null;
                if (view === 'Sud' && n.dec > 0) return null;
                const { x, y } = project(n.ra, n.dec);
                return (
                    <text key={i} x={x} y={y} fontSize="10" fill="#60a5fa" opacity="0.4" textAnchor="middle" className="pointer-events-none select-none uppercase font-bold tracking-widest">
                        {n.name}
                    </text>
                );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
