'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText, Flower2, Loader2, BookOpen, Crown } from "lucide-react";

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
const LARGEUR_NOEUD = 240;
const HAUTEUR_VISUELLE = 100;
const DISTANCE_ENTRE_NOEUDS = 160;

export default function HierarchieJaponPage() {
  const [personnes, setPersonnes] = useState<HierarchieJapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hierarchieJapon')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'accès au Shogunat");
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
        setError("Les parchemins impériaux sont inaccessibles.");
        setLoading(false);
      });
  }, []);

  // Calcul du layout pour le SVG (centré horizontalement dans son conteneur)
  const positions: Position[] = personnes.map((item, index) => ({
    x: 20, 
    y: 20 + (index * DISTANCE_ENTRE_NOEUDS), 
    noeud: item 
  }));

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-2 md:p-8 min-h-screen bg-[#fdfbf7]">
      
      {/* NAVIGATION */}
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-800 hover:text-red-600 font-bold group transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm md:text-base">Retour au Shogunat</span>
        </Link>
      </nav>

      {/* HEADER */}
      <header className="mb-8 md:mb-16 text-center max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-4 text-red-700">
          <Landmark size={40} className="md:w-12 md:h-12 drop-shadow-sm" />
        </div>
        <h1 className="text-xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase leading-tight">
          🗾 Hiérarchie du Soleil Levant
        </h1>
        <p className="text-slate-500 italic text-[10px] md:text-sm">Structure sociale et protocolaire du Japon féodal</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-12 md:w-20 bg-red-200"></span>
          <Flower2 size={14} className="text-red-400" />
          <span className="h-[1px] w-12 md:w-20 bg-red-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-red-800" size={32} />
          <p className="text-red-800 font-serif text-[10px] uppercase tracking-widest">Ouverture des parchemins...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 items-start">
          
          {/* 1. SECTION REGISTRE (TABLEAU OU CARTES) */}
          <div className="bg-white border-l-4 border-l-red-700 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[600px] md:h-[750px]">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
              <ScrollText size={18} className="text-red-700" />
              <h3 className="text-slate-800 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Tableau des Rangs</h3>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {/* Desktop Table (Caché sur mobile) */}
              <table className="hidden md:table w-full text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-center w-20 bg-slate-50">Niveau</th>
                    <th className="px-6 py-4 text-left bg-slate-50">Titre</th>
                    <th className="px-6 py-4 text-left bg-slate-50">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-6 font-bold text-red-700 bg-red-50/20 text-xs text-center">{p.id}</td>
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-900 leading-tight">{p.titre}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{p.section}</div>
                      </td>
                      <td className="px-6 py-6 text-slate-600 text-xs leading-relaxed font-serif italic">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards (Caché sur Desktop) */}
              <div className="md:hidden space-y-4 p-4">
                {personnes.map((p) => (
                  <div key={p.id} className="bg-[#fffcf9] border border-red-100 rounded-xl p-4 relative shadow-sm">
                    <div className="absolute top-0 right-0 bg-red-700 text-white px-3 py-1 text-[10px] font-black rounded-bl-lg">
                      #{p.id}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={14} className="text-red-700 shrink-0" />
                      <div>
                        <h4 className="font-black text-slate-900 text-sm uppercase leading-tight">{p.titre}</h4>
                        <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{p.section}</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-white p-3 rounded-lg border border-red-50 flex gap-3 items-start">
                      <BookOpen size={14} className="text-slate-300 mt-1 shrink-0" />
                      <p className="text-[11px] text-slate-600 italic font-serif leading-relaxed line-clamp-4">
                        {p.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG (CORRIGÉ POUR LES TRAITS) */}
          <div className="bg-[#f4f1ea] border-2 border-slate-200 rounded-3xl p-4 overflow-auto h-[600px] md:h-[750px] shadow-inner relative flex justify-center">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
              
              {/* PREMIER PASSAGE : DESSIN DES LIGNES (ARRIÈRE-PLAN) */}
              {positions.map((p, i) => (
                <g key={`line-${p.noeud.id}`}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD / 2} 
                      y1={p.y + HAUTEUR_VISUELLE / 2} 
                      x2={p.x + LARGEUR_NOEUD / 2} 
                      y2={positions[i + 1].y + HAUTEUR_VISUELLE / 2} 
                      stroke="#fca5a5" 
                      strokeWidth="2" 
                      strokeDasharray="4 4"
                    />
                  )}
                </g>
              ))}

              {/* SECOND PASSAGE : DESSIN DES NOEUDS (PREMIER PLAN) */}
              {positions.map((p) => (
                <foreignObject 
                  key={`node-${p.noeud.id}`}
                  x={p.x} 
                  y={p.y} 
                  width={LARGEUR_NOEUD} 
                  height={HAUTEUR_VISUELLE} 
                  className="overflow-visible"
                >
                  <div className="min-h-[100px] w-full bg-white border border-slate-300 rounded-lg p-3 shadow-md flex flex-col items-center justify-center text-center hover:border-red-600 transition-all relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[9px] font-bold px-3 py-1 rounded shadow-sm z-10 uppercase tracking-widest">
                      Rang {p.noeud.id}
                    </div>
                    <p className="text-[9px] text-red-600 font-bold uppercase mb-1 leading-tight tracking-tighter w-full px-2">
                      {p.noeud.section}
                    </p>
                    <h4 className="text-[13px] font-black text-slate-900 leading-snug px-2">
                      {p.noeud.titre}
                    </h4>
                  </div>
                </foreignObject>
              ))}
            </svg>
          </div>

        </div>
      )}
    </main>
  );
}