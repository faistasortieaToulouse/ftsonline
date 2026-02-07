'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Crown, ScrollText } from "lucide-react";

/* ... (Types et config inchangés) ... */
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
        /* Conteneur principal : Flex col sur mobile (Tableau en haut), Grid sur XL (Tableau à gauche) */
        <div className="max-w-7xl mx-auto flex flex-col xl:grid xl:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* 1. TABLEAU : S'affiche en PREMIER sur mobile */}
          <div className="w-full bg-white border-l-4 border-l-red-800 rounded-r-2xl shadow-xl overflow-hidden border border-slate-200 order-1">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-red-800" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Protocole</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed md:table-auto">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold">
                  <tr>
                    <th className="px-2 md:px-4 py-4 text-left w-12 md:w-20">Rang</th>
                    <th className="px-2 md:px-4 py-4 text-left w-32 md:w-48">Titre</th>
                    <th className="px-2 md:px-4 py-4 text-left">Signification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/50">
                      <td className="px-2 md:px-4 py-4 text-center font-bold text-red-900 bg-red-50/30 text-xs">
                        {p.id}
                      </td>
                      <td className="px-2 md:px-4 py-4">
                        <div className="font-bold text-slate-900 text-xs md:text-sm break-words">{p.titre}</div>
                        <div className="text-[8px] md:text-[9px] text-red-600 uppercase font-bold">{p.section}</div>
                      </td>
                      <td className="px-2 md:px-4 py-4 text-slate-600 text-[11px] md:text-xs italic leading-relaxed break-words">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL : S'affiche en SECOND sur mobile */}
          <div className="w-full bg-[#f9f5f4] border-2 border-red-50 rounded-3xl p-4 md:p-8 overflow-auto max-h-[600px] xl:max-h-[750px] shadow-inner relative order-2">
            <div className="flex justify-center">
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
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-800 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                          RANG {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-red-600 font-bold uppercase mb-1">{p.noeud.section}</p>
                        <h4 className="text-[14px] md:text-[15px] font-black text-slate-900 leading-tight">{p.noeud.titre}</h4>
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