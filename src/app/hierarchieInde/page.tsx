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
const LARGEUR_NOEUD = 260; // Élargi pour les titres indiens
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
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieInde')
      .then(res => res.json())
      .then((data: HierarchieInde[]) => {
        setPersonnes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-8 min-h-screen bg-[#f8f9fa]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-orange-600">
          <Landmark size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🇮🇳 Hiérarchie de l'Inde
        </h1>
        <p className="text-slate-500 italic">Structure ancestrale et organisationnelle</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-orange-200"></span>
          <Sprout size={16} className="text-green-600" />
          <span className="h-[1px] w-20 bg-orange-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-orange-800 font-serif italic">
          Consultation des registres...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-orange-600 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-orange-700" />
              <h3 className="text-slate-800 font-bold uppercase text-xs">Tableau Détailé</h3>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Désignation</th>
                    <th className="px-6 py-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-orange-700">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 leading-tight">{p.titre}</div>
                        <div className="text-[10px] text-green-700 font-semibold uppercase">{p.section}</div>
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

          {/* ARBRE VISUEL SANS COUPURE */}
          <div className="order-1 xl:order-2 bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[700px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Lignes pointillées */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 4"
                    />
                  )}
                  
                  {/* Conteneur ForeignObject avec sécurité overflow */}
                  <foreignObject 
                    x={p.x} 
                    y={p.y} 
                    width={LARGEUR_NOEUD} 
                    height={DISTANCE_ENTRE_NOEUDS - 20}
                    className="overflow-visible"
                  >
                    <div className="
                      min-h-[100px] w-full 
                      bg-white border-2 border-orange-100 rounded-xl 
                      p-4 shadow-md flex flex-col items-center justify-center 
                      text-center transition-all hover:border-orange-500 hover:shadow-lg
                    ">
                      {/* Badge de Rang */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                        NIVEAU {p.noeud.id}
                      </div>
                      
                      {/* Section (ex: Administration Royale) */}
                      <p className="text-[10px] text-green-700 font-black uppercase mb-1 tracking-widest break-words w-full">
                        {p.noeud.section}
                      </p>
                      
                      {/* Titre (ex: Maharadjah) */}
                      <h4 className="text-[15px] font-black text-slate-900 leading-tight break-words w-full">
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
