'use client';

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText } from "lucide-react";

/* =========================
    TYPES
========================= */

interface HierarchieJapon {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: HierarchieJapon;
};

/* =========================
    CONFIGURATIONS
========================= */

const LARGEUR_NOEUD = 220;
const HAUTEUR_NOEUD = 90;
const ESPACE_V = 50;

/* =========================
    LOGIQUE LAYOUT
========================= */

function calculLayout(liste: HierarchieJapon[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * (HAUTEUR_NOEUD + ESPACE_V)), noeud: item });
  });
}

/* =========================
    COMPOSANT PRINCIPAL
========================= */

export default function HierarchieJaponPage() {
  const [personnes, setPersonnes] = useState<HierarchieJapon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieJapon')
      .then(res => res.json())
      .then((data: HierarchieJapon[]) => {
        setPersonnes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 40;

  return (
    <main className="p-8 min-h-screen bg-[#fdfbf7]"> {/* Fond papier washi */}
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-800 hover:text-red-600 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au Shogunat
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4">
          <Landmark size={48} className="text-red-700" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🗾 Hiérarchie du Soleil Levant
        </h1>
        <p className="text-slate-500 italic">Structure sociale et protocolaire du Japon féodal</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-red-200"></span>
          <div className="w-3 h-3 border-2 border-red-600 rotate-45"></div>
          <span className="h-[1px] w-20 bg-red-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-red-800 font-serif italic">
          Ouverture des parchemins impériaux...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX (GAUCHE) */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-red-700 border-y border-r border-slate-200 rounded-r-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
              <ScrollText size={18} className="text-red-700" />
              <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest">Tableau des Rangs</h3>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Niveau</th>
                    <th className="px-6 py-4">Titre & Section</th>
                    <th className="px-6 py-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-700 font-bold border border-red-100">
                          {p.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.titre}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.section}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs leading-relaxed">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL (DROITE) */}
          <div className="order-1 xl:order-2 bg-[#f4f1ea] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[700px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Ligne de connexion */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4"
                    />
                  )}
                  
                  {/* Encart du nœud */}
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD}>
                    <div className="w-full h-full bg-white border border-slate-300 rounded-lg p-3 shadow-sm flex flex-col items-center justify-center text-center group hover:border-red-600 transition-colors">
                      <div className="absolute -top-3 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Rang {p.noeud.id}
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-medium mb-1 tracking-tighter">
                        {p.noeud.section}
                      </p>
                      <h4 className="text-[13px] font-black text-slate-900 leading-tight">
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
