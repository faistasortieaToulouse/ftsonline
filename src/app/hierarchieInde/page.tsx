'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText, Sprout } from "lucide-react";

/* =========================
    TYPES
========================= */
interface HierarchieInde {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: HierarchieInde;
};

/* =========================
    CONFIGURATIONS
========================= */
const LARGEUR_NOEUD = 260; 
const HAUTEUR_VISUELLE = 100; 
const DISTANCE_ENTRE_NOEUDS = 160; 

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(liste: HierarchieInde[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieIndePage() {
  const [personnes, setPersonnes] = useState<HierarchieInde[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieInde')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'accès aux registres");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setPersonnes(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de joindre les archives impériales.");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f8f9fa]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-orange-600">
          <Landmark size={48} className="drop-shadow-sm" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🇮🇳 Hiérarchie de l'Inde
        </h1>
        <p className="text-slate-500 italic text-sm">Structure ancestrale et organisationnelle</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-16 md:w-20 bg-orange-200"></span>
          <Sprout size={16} className="text-green-600" />
          <span className="h-[1px] w-16 md:w-20 bg-orange-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-orange-800 font-serif italic uppercase tracking-[0.2em] text-[10px]">
          Consultation des registres...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. TABLEAU DES NIVEAUX AVEC SCROLL INTERNE */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-orange-600 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
              <ScrollText size={18} className="text-orange-700" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Tableau Détaillé</h3>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left w-16 bg-slate-50">#</th>
                    <th className="px-6 py-4 text-left bg-slate-50">Désignation</th>
                    <th className="px-6 py-4 text-left bg-slate-50">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-6 font-bold text-orange-700 bg-orange-50/20 text-xs">{p.id}</td>
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-900 leading-tight text-xs md:text-sm">{p.titre}</div>
                        <div className="text-[9px] md:text-[10px] text-green-700 font-bold uppercase mt-1 tracking-tighter">{p.section}</div>
                      </td>
                      <td className="px-6 py-6 text-slate-600 text-[11px] md:text-xs leading-relaxed italic font-serif">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG AVEC SCROLL INTERNE */}
          <div className="order-1 xl:order-2 bg-slate-100/50 border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto h-[750px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[100px] w-full bg-white border border-orange-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-orange-500 hover:shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-widest">
                          Niveau {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-green-700 font-black uppercase mb-1 tracking-widest break-words w-full px-2">
                          {p.noeud.section}
                        </p>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight px-2">
                          {p.noeud.titre}
                        </h4>
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