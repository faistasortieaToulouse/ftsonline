'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Crown, ScrollText, History } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface Abyssinien {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: Abyssinien;
};

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
        // On assure l'ordre hiérarchique par l'ID
        setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 60;

  return (
    <main className="p-8 min-h-screen bg-[#fdfaf9]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-900 hover:text-red-700 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-red-700">
          <Crown size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          👑 Hiérarchie Abyssinienne
        </h1>
        <p className="text-slate-500 italic font-serif tracking-wide">Titres de noblesse et fonctions de l'Empire d'Éthiopie</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-red-200"></span>
          <div className="w-2 h-2 bg-red-700 rotate-45"></div>
          <span className="h-[1px] w-20 bg-red-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-red-900 font-serif italic uppercase tracking-widest text-xs">
          Lecture des chroniques royales...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-red-800 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-red-800" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-[0.2em]">Protocole Impérial</h3>
            </div>
            <div className="overflow-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left">Rang</th>
                    <th className="px-6 py-4 text-left">Titre / Section</th>
                    <th className="px-6 py-4 text-left">Signification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-red-900 bg-red-50/30">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{p.titre}</div>
                        <div className="text-[10px] text-red-600 font-semibold uppercase mt-0.5">{p.section}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs leading-relaxed italic">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL DYNAMIQUE */}
          <div className="order-1 xl:order-2 bg-[#f9f5f4] border-2 border-red-50 rounded-3xl p-8 overflow-auto max-h-[750px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Lignes de descendance du trône */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#991b1b" strokeWidth="1.5" strokeDasharray="4 4"
                    />
                  )}
                  
                  <foreignObject 
                    x={p.x} 
                    y={p.y} 
                    width={LARGEUR_NOEUD} 
                    height={DISTANCE_ENTRE_NOEUDS - 20}
                    className="overflow-visible"
                  >
                    <div className="
                      min-h-[110px] w-full 
                      bg-white border-2 border-red-50 rounded-xl 
                      p-4 shadow-md flex flex-col items-center justify-center 
                      text-center transition-all hover:border-red-700 hover:shadow-lg relative
                    ">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-800 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-md border border-red-400">
                        RANG {p.noeud.id}
                      </div>
                      
                      <p className="text-[10px] text-red-600 font-bold uppercase mb-1 tracking-widest break-words w-full px-2">
                        {p.noeud.section}
                      </p>
                      
                      <h4 className="text-[17px] font-black text-slate-900 leading-tight break-words w-full px-4">
                        {p.noeud.titre}
                      </h4>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>

        </div>
      )}
    </main>
  );
}
