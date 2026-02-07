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
  institution: string | null;
  superieur: string | null;
  recteur?: string | null;
  ordre?: string | null;
  niveau_equivalent?: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieEglise')
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de joindre les archives");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur de connexion aux données.");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 60;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#fdfaf8]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-800 hover:text-purple-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à la Curie
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-purple-900">
          <Church size={48} className="drop-shadow-sm" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          ⛪ Hiérarchie de l'Église
        </h1>
        <p className="text-slate-500 italic font-serif text-sm">Organisation et Sièges de la Chrétienté</p>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-purple-900 font-serif italic uppercase tracking-widest text-[10px]">
          Chargement...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. TABLEAU AVEC BARRE DÉFILANTE (Même hauteur que l'arbre) */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-purple-800 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
              <ScrollText size={18} className="text-purple-900" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres Ecclésiastiques</h3>
            </div>
            
            <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-purple-100">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-4 text-left w-16 bg-slate-50">Rang</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Dignitaire</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Institution / Lieu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-6 text-center font-bold text-purple-900 bg-purple-50/20 text-xs">{p.id}</td>
                      <td className="px-4 py-6">
                        <div className="font-bold text-slate-900 text-xs md:text-sm">{p.personne}</div>
                        <div className="text-[9px] md:text-[10px] text-slate-400 italic">Sup: {p.superieur || 'Souverain'}</div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="text-[10px] md:text-xs font-semibold text-purple-800 uppercase leading-tight">{p.institution || 'Curie'}</div>
                        <div className="text-[9px] md:text-[10px] text-slate-400 font-serif italic mt-1">{p.lieu}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG (Hauteur fixe identique) */}
          <div className="order-1 xl:order-2 bg-[#f8f5f2] border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto h-[750px] shadow-inner relative scrollbar-none">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[110px] w-full bg-white border border-purple-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-purple-800 hover:shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-md border border-purple-400 uppercase tracking-tighter whitespace-nowrap">
                          Rang {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-purple-700 font-black uppercase mb-1 tracking-widest truncate w-full px-2">
                          {p.noeud.institution || "Curie"}
                        </p>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight">
                          {p.noeud.personne}
                        </h4>
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

        </div>
      )}
    </main>
  );
}