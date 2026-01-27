'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface Chiite {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: Chiite;
};

const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

function calculLayout(liste: Chiite[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieChiitePage() {
  const [personnes, setPersonnes] = useState<Chiite[]>([]);
  const [loading, setLoading] = useState(true);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieChiite')
      .then(res => res.json())
      .then((data: Chiite[]) => {
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
    <main className="p-8 min-h-screen bg-[#f8faf8]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-emerald-700">
          <Landmark size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🕌 Hiérarchie Chiite
        </h1>
        <p className="text-slate-500 italic font-serif">Organisation des autorités religieuses et savantes</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-emerald-200"></span>
          <div className="w-2 h-2 bg-emerald-600 rotate-45"></div>
          <span className="h-[1px] w-20 bg-emerald-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-emerald-900 font-serif italic">
          Consultation des registres...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-emerald-700 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-emerald-800" />
              <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest">Détails des Titres</h3>
            </div>
            <div className="overflow-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left">Rang</th>
                    <th className="px-6 py-4 text-left">Titre</th>
                    <th className="px-6 py-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-emerald-800 bg-emerald-50/50">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.titre}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase mt-1">{p.section}</div>
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

          {/* ARBRE VISUEL SVG */}
          <div className="order-1 xl:order-2 bg-[#f1f5f1] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[750px] shadow-inner">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Lignes de filiation spirituelle */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#059669" strokeWidth="1.5" strokeDasharray="5 5"
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
                      bg-white border-2 border-emerald-100 rounded-xl 
                      p-4 shadow-md flex flex-col items-center justify-center 
                      text-center transition-all hover:border-emerald-600 hover:shadow-lg relative
                    ">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[10px] font-black px-4 py-1 rounded-md shadow-md">
                        NIVEAU {p.noeud.id}
                      </div>
                      
                      <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1 tracking-widest break-words w-full">
                        {p.noeud.section}
                      </p>
                      
                      <h4 className="text-[15px] font-black text-slate-900 leading-tight break-words w-full px-2">
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
