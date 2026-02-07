'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Shield, ScrollText, Cross } from "lucide-react";

/* =========================
    TYPES
========================= */
interface Hospitalier {
  id: number;
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string;
  niveau_equivalent: string | null;
}

type Position = {
  x: number;
  y: number;
  noeud: Hospitalier;
};

/* =========================
    CONFIGURATIONS
========================= */
const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(liste: Hospitalier[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieHospitalierPage() {
  const [personnes, setPersonnes] = useState<Hospitalier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieHospitalier')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'accès aux registres");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          const withId = data.map((p: any, index: number) => ({
            ...p,
            id: index + 1,
          }));
          setPersonnes(withId);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger la hiérarchie de l'Ordre.");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#fcfaf7]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à la commanderie
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-blue-900">
          <Shield size={48} className="drop-shadow-md" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🛡️ Hiérarchie Hospitalière
        </h1>
        <p className="text-slate-500 italic font-serif text-sm">Ordre Souverain de Saint-Jean de Jérusalem</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-16 md:w-20 bg-blue-200"></span>
          <div className="w-2 h-2 bg-blue-900 rotate-45"></div>
          <span className="h-[1px] w-16 md:w-20 bg-blue-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-serif italic uppercase tracking-[0.2em] text-[10px]">
          Lecture des parchemins de l'Ordre...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. TABLEAU DES NIVEAUX AVEC SCROLL */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-blue-900 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
              <ScrollText size={18} className="text-blue-900" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres de la Langue</h3>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-4 text-left w-16 bg-slate-50">Niveau</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Dignitaire</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Institution / Lieu</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Supérieur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-6 text-center font-bold text-blue-900 bg-blue-50/20 text-xs">{p.id}</td>
                      <td className="px-4 py-6 font-bold text-slate-900 text-xs md:text-sm">{p.personne}</td>
                      <td className="px-4 py-6">
                        <div className="text-[10px] md:text-xs font-semibold text-blue-800 leading-tight">{p.institution}</div>
                        <div className="text-[9px] md:text-[10px] text-slate-400 italic mt-1">{p.lieu}</div>
                      </td>
                      <td className="px-4 py-6 text-slate-500 text-[11px] italic leading-relaxed">{p.superieur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG AVEC SCROLL */}
          <div className="order-1 xl:order-2 bg-[#f4f2ee] border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto h-[750px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[110px] w-full bg-white border border-blue-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-blue-900 hover:shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[9px] font-black px-4 py-1 rounded shadow-md border border-blue-700 uppercase">
                          Rang {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-blue-700 font-black uppercase mb-1 tracking-widest break-words w-full px-2">
                          {p.noeud.institution}
                        </p>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight px-2">
                          {p.noeud.personne}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-2 font-serif italic truncate w-full px-4">
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