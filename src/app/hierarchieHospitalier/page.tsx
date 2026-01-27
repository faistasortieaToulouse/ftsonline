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
const DISTANCE_ENTRE_NOEUDS = 170; // Un peu plus d'espace pour les titres longs

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
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieHospitalier')
      .then(res => res.json())
      .then((data) => {
        const withId = data.map((p: any, index: number) => ({
          ...p,
          id: index + 1,
        }));
        setPersonnes(withId);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-8 min-h-screen bg-[#fcfaf7]">
      
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à la commanderie
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-blue-900">
          <Shield size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🛡️ Hiérarchie Hospitalière
        </h1>
        <p className="text-slate-500 italic font-serif">Ordre Souverain de Saint-Jean de Jérusalem</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-20 bg-blue-200"></span>
          <div className="w-2 h-2 bg-blue-900 rotate-45"></div>
          <span className="h-[1px] w-20 bg-blue-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-serif italic">
          Lecture des parchemins de l'Ordre...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU DES NIVEAUX */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-blue-900 rounded-r-2xl shadow-xl overflow-hidden border-y border-r border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-blue-900" />
              <h3 className="text-slate-800 font-bold uppercase text-xs">Registres de la Langue</h3>
            </div>
            <div className="overflow-auto max-h-[750px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-left">Niveau</th>
                    <th className="px-4 py-4 text-left">Dignitaire</th>
                    <th className="px-4 py-4 text-left">Institution / Lieu</th>
                    <th className="px-4 py-4 text-left">Supérieur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-blue-900 bg-blue-50/50">{p.id}</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{p.personne}</td>
                      <td className="px-4 py-4">
                        <div className="text-xs font-semibold text-blue-800">{p.institution}</div>
                        <div className="text-[10px] text-slate-400 italic">{p.lieu}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-xs italic">{p.superieur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL (SVG ADAPTATIF) */}
          <div className="order-1 xl:order-2 bg-[#f4f2ee] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[750px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Lignes de filiation */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5"
                    />
                  )}
                  
                  {/* Nœud via ForeignObject */}
                  <foreignObject 
                    x={p.x} 
                    y={p.y} 
                    width={LARGEUR_NOEUD} 
                    height={DISTANCE_ENTRE_NOEUDS - 20}
                    className="overflow-visible"
                  >
                    <div className="
                      min-h-[110px] w-full 
                      bg-white border-2 border-blue-100 rounded-xl 
                      p-4 shadow-md flex flex-col items-center justify-center 
                      text-center transition-all hover:border-blue-900 hover:shadow-lg relative
                    ">
                      {/* Badge de Rang (Croix de Malte stylisée) */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] font-black px-3 py-1 rounded shadow-md border border-blue-700">
                        RANG {p.noeud.id}
                      </div>
                      
                      {/* Institution (ex: Grand Maître) */}
                      <p className="text-[10px] text-blue-700 font-black uppercase mb-1 tracking-widest break-words w-full">
                        {p.noeud.institution}
                      </p>
                      
                      {/* Nom de la personne */}
                      <h4 className="text-[14px] font-black text-slate-900 leading-tight break-words w-full px-2">
                        {p.noeud.personne}
                      </h4>

                      {/* Lieu optionnel en petit */}
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
