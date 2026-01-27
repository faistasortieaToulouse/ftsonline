'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Church, ScrollText, Cross } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface Personne {
  id: number;
  personne: string;
  lieu: string;
  recteur: string | null;
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

export default function HierarchieEglisePage() {
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieEglise')
      .then((res) => res.json())
      .then((data: Personne[]) => {
        // Attribution des IDs selon l'ordre du fichier (du sommet à la base)
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
    <main className="p-8 min-h-screen bg-[#fdfaf8]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-800 hover:text-purple-600 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à la Curie
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-purple-900">
          <Church size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          ⛪ Hiérarchie de l'Église
        </h1>
        <p className="text-slate-500 italic font-serif">Organisation et Sièges de la Chrétienté</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-purple-200"></span>
          <Cross size={16} className="text-purple-700" />
          <span className="h-[1px] w-20 bg-purple-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-purple-900 font-serif italic">
          Ouverture des archives vaticanes...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-purple-800 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-purple-900" />
              <h3 className="text-slate-800 font-bold uppercase text-xs">Registres Ecclésiastiques</h3>
            </div>
            <div className="overflow-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-left">Rang</th>
                    <th className="px-4 py-4 text-left">Dignitaire</th>
                    <th className="px-4 py-4 text-left">Institution / Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-purple-900 bg-purple-50/50">{p.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{p.personne}</div>
                        <div className="text-[10px] text-slate-400 italic">Sup: {p.superieur || 'Souverain'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-semibold text-purple-800">{p.institution || 'Curie'}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{p.lieu}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL (SVG) */}
          <div className="order-1 xl:order-2 bg-[#f8f5f2] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[750px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4"
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
                      bg-white border-2 border-purple-100 rounded-xl 
                      p-4 shadow-md flex flex-col items-center justify-center 
                      text-center transition-all hover:border-purple-800 hover:shadow-lg relative
                    ">
                      {/* Badge de Rang */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                        RANG {p.noeud.id}
                      </div>
                      
                      {/* Institution */}
                      <p className="text-[10px] text-purple-700 font-black uppercase mb-1 tracking-widest break-words w-full">
                        {p.noeud.institution || "Curie"}
                      </p>
                      
                      {/* Nom du Dignitaire */}
                      <h4 className="text-[15px] font-black text-slate-900 leading-tight break-words w-full px-2">
                        {p.noeud.personne}
                      </h4>

                      {/* Lieu */}
                      <p className="text-[9px] text-slate-400 mt-2 font-serif italic">
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
