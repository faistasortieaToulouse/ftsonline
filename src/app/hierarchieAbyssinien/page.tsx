'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Crown, ScrollText } from "lucide-react";

/* ... (Types et config restent identiques) ... */
interface Abyssinien { id: number; section: string; titre: string; description: string; }
type Position = { x: number; y: number; noeud: Abyssinien; };
const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

function calculLayout(liste: Abyssinien[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieAbyssinienPage() {
  const [personnes, setPersonnes] = useState<Abyssinien[]>([]);
  const [loading, setLoading] = useState(true);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieAbyssinien')
      .then(res => res.json())
      .then((data: Abyssinien[]) => {
        setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading) { calculLayout(personnes, 20, 20, positions); }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 60;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#fdfaf9]">
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-900 hover:text-red-700 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-red-700">
          <Crown size={40} className="md:w-12 md:h-12" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          👑 Hiérarchie Abyssinienne
        </h1>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-red-900 italic">Lecture des chroniques...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* 1. TABLEAU : On ajoute 'overflow-x-auto' pour le mobile */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-red-800 rounded-r-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-red-800" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Protocole</h3>
            </div>
            
            <div className="overflow-x-auto"> {/* Permet au tableau de glisser sans casser la page */}
              <table className="w-full text-sm min-w-[500px]"> {/* min-w force une largeur lisible */}
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-4 text-left w-16">Rang</th>
                    <th className="px-4 py-4 text-left">Titre</th>
                    <th className="px-4 py-4 text-left">Signification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/50">
                      <td className="px-4 py-4 text-center font-bold text-red-900 bg-red-50/30">{p.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{p.titre}</div>
                        <div className="text-[9px] text-red-600 uppercase font-bold">{p.section}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-xs italic leading-relaxed">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL : Gardé sur le côté, mais scrollable localement */}
          <div className="order-1 xl:order-2 bg-[#f9f5f4] border-2 border-red-50 rounded-3xl p-4 md:p-8 overflow-auto max-h-[500px] xl:max-h-[750px] shadow-inner relative">
            <div className="min-w-[300px] flex justify-center"> {/* Empêche l'écrasement de l'arbre */}
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#991b1b" strokeWidth="1.5" strokeDasharray="4 4"
                      />
                    )}
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[110px] w-full bg-white border-2 border-red-50 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center relative hover:border-red-700 transition-all">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-800 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md">
                          RANG {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-red-600 font-bold uppercase mb-1">{p.noeud.section}</p>
                        <h4 className="text-[15px] font-black text-slate-900 leading-tight">{p.noeud.titre}</h4>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}