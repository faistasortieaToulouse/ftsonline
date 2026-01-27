'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Church, ScrollText, Mountain } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface Personne {
  id: number;
  personne: string;
  lieu: string | null;
  institution: string | null;
  ordre: string | null;
  superieur: string | null;
  niveau_equivalent: string | null;
}

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

function calculLayout(liste: Personne[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieChartreuxPage() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieChartreux')
      .then(res => res.json())
      .then((data: Personne[]) => {
        // Maintien de l'ordre hiérarchique strict
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
    <main className="p-8 min-h-screen bg-[#f2f4f5]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-blue-900 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au Monastère
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-slate-400">
          <Mountain size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter uppercase">
          ⛪ Hiérarchie des Chartreux
        </h1>
        <p className="text-slate-500 italic font-serif tracking-wide text-sm">Statuts de l'Ordre de Saint Bruno</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-slate-300"></span>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
          <span className="h-[1px] w-20 bg-slate-300"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-600 font-serif italic uppercase tracking-widest text-xs">
          Silence... Lecture des statuts en cours...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-slate-800 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-slate-600" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-[0.2em]">Registres Conventuels</h3>
            </div>
            <div className="overflow-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left">Rang</th>
                    <th className="px-6 py-4 text-left">Personne / Titre</th>
                    <th className="px-6 py-4 text-left">Institution / Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-800 bg-slate-50/50">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.personne}</div>
                        <div className="text-[10px] text-slate-400 italic">Sup: {p.superieur || 'Chapitre Général'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-blue-900 uppercase tracking-tighter">{p.institution || 'Ordre'}</div>
                        <div className="text-[10px] text-slate-500 font-serif italic">{p.lieu || 'Grande Chartreuse'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL SVG */}
          <div className="order-1 xl:order-2 bg-[#e9ecef] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[750px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Lignes de structure */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3"
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
                      bg-white border border-slate-200 rounded-lg 
                      p-4 shadow-sm flex flex-col items-center justify-center 
                      text-center transition-all hover:border-slate-800 hover:shadow-md relative
                    ">
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-3 py-0.5 rounded uppercase tracking-widest">
                        Niveau {p.noeud.id}
                      </div>
                      
                      <p className="text-[9px] text-blue-800 font-bold uppercase mb-1 tracking-widest break-words w-full">
                        {p.noeud.institution || "Règle de l'Ordre"}
                      </p>
                      
                      <h4 className="text-[14px] font-bold text-slate-800 leading-tight break-words w-full px-2">
                        {p.noeud.personne}
                      </h4>

                      <p className="text-[9px] text-slate-400 mt-2 font-serif">
                        {p.noeud.lieu}
                      </p>
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
