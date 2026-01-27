'use client';

import { useEffect, useState } from 'react';
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
const LARGEUR_NOEUD = 240; // On élargit un peu pour plus de confort
const HAUTEUR_VISUELLE = 100; // La hauteur de la boîte blanche
const DISTANCE_ENTRE_NOEUDS = 160; // Distance totale entre le haut d'un nœud et le suivant

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(liste: HierarchieJapon[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    // On utilise DISTANCE_ENTRE_NOEUDS pour que les boîtes ne se chevauchent jamais
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

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

  // Calcul dynamique de la hauteur du SVG
  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-8 min-h-screen bg-[#fdfbf7]">
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-800 hover:text-red-600 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au Shogunat
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4"><Landmark size={48} className="text-red-700" /></div>
        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🗾 Hiérarchie du Soleil Levant
        </h1>
        <p className="text-slate-500 italic">Structure sociale et protocolaire du Japon féodal</p>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-red-800 font-serif italic">Ouverture des parchemins...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
          
          {/* TABLEAU */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-red-700 rounded-r-2xl shadow-xl overflow-hidden">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-red-700" />
              <h3 className="text-slate-800 font-bold uppercase text-xs">Tableau des Rangs</h3>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left">Niveau</th>
                    <th className="px-6 py-4 text-left">Titre</th>
                    <th className="px-6 py-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-red-700">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.titre}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.section}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ARBRE VISUEL CORRIGÉ */}
          <div className="order-1 xl:order-2 bg-[#f4f1ea] border-2 border-slate-200 rounded-3xl p-8 overflow-auto max-h-[700px] shadow-inner relative">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {/* Ligne de connexion : descend jusqu'au prochain nœud */}
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4"
                    />
                  )}
                  
                  {/* foreignObject avec hauteur plus grande pour éviter la coupure */}
                  <foreignObject 
                    x={p.x} 
                    y={p.y} 
                    width={LARGEUR_NOEUD} 
                    height={DISTANCE_ENTRE_NOEUDS - 20}
                    className="overflow-visible"
                  >
                    <div className="
                      min-h-[100px] w-full 
                      bg-white border border-slate-300 rounded-lg 
                      p-3 shadow-sm flex flex-col items-center justify-center 
                      text-center transition-colors hover:border-red-600
                    ">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                        Rang {p.noeud.id}
                      </div>
                      
                      <p className="text-[10px] text-red-600 font-bold uppercase mb-1 leading-tight break-words w-full">
                        {p.noeud.section}
                      </p>
                      
                      <h4 className="text-[14px] font-black text-slate-900 leading-snug break-words w-full">
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
