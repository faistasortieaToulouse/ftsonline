"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, Scroll, ChevronRight, Star } from "lucide-react";

/* =========================
    TYPES
========================= */
type Personne = {
  id: number;
  section: string;
  titre: string;
  description: string;
  enfants?: Personne[];
};

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

/* =========================
    CONFIGURATIONS VISUELLES
========================= */
const LARGEUR_NOEUD = 280;
const HAUTEUR_NOEUD = 100;
const ESPACE_V = 60;
const HAUTEUR_MAX_SECTION = 750;

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(noeud: Personne, x: number, y: number, positions: Position[]): number {
  positions.push({ x, y, noeud });
  let currentY = y;
  if (noeud.enfants && noeud.enfants.length > 0) {
    noeud.enfants.forEach(e => {
      currentY = calculLayout(e, x, currentY + HAUTEUR_NOEUD + ESPACE_V, positions);
    });
  }
  return currentY;
}

/* =========================
    COMPOSANT PRINCIPAL
========================= */
export default function HierarchieOttomanPage() {
  const [arbre, setArbre] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const positions: Position[] = [];

  useEffect(() => {
    fetch("/api/hierarchieOttoman")
      .then((res) => res.json())
      .then((data: Personne[]) => {
        if (!data || data.length === 0) return;
        const nodes = data.map(d => ({ ...d, enfants: [] }));
        for (let i = 0; i < nodes.length - 1; i++) {
          nodes[i].enfants = [nodes[i + 1]];
        }
        setArbre([nodes[0]]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (arbre.length > 0) {
    calculLayout(arbre[0], 20, 30, positions);
  }

  const hauteurContenu = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 60;
  const hauteurAffichee = Math.min(hauteurContenu, HAUTEUR_MAX_SECTION);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#fcfdfa]">
      <nav className="mb-8 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au Divan
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
          <Landmark size={50} className="text-emerald-700 opacity-80" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          La Sublime Porte
        </h1>
        <p className="text-emerald-600 font-serif italic text-lg uppercase tracking-[0.2em] text-sm">
          Hiérarchie de l'Empire Ottoman
        </p>
        <div className="mt-6 flex justify-center items-center gap-3">
          <div className="h-px w-16 bg-emerald-200"></div>
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <div className="h-px w-16 bg-emerald-200"></div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-emerald-900 font-serif italic uppercase text-xs tracking-widest">
          Consultation des archives impériales...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* 1. DÉTAILS DES FONCTIONS (GAUCHE) */}
          <section 
            style={{ height: `${hauteurAffichee}px` }}
            className="order-1 xl:order-1 bg-white border border-emerald-100 rounded-3xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="bg-emerald-50/50 border-b border-emerald-100 p-5 flex items-center gap-3">
              <Scroll size={20} className="text-emerald-700" />
              <h3 className="text-emerald-900 font-black uppercase text-xs tracking-widest">Le protocole du Divan</h3>
            </div>
            <div className="overflow-y-auto flex-grow p-6 space-y-8 scrollbar-thin scrollbar-thumb-emerald-100">
              {positions.map((p) => (
                <div key={p.noeud.id} className="relative pl-6 group">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-emerald-100 group-hover:bg-amber-400 transition-colors"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{p.noeud.section}</span>
                    <ChevronRight size={12} className="text-emerald-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{p.noeud.titre}</h4>
                  <p className="text-slate-500 text-sm italic font-serif leading-relaxed pr-4">{p.noeud.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. ARBRE SCHÉMATIQUE (DROITE) */}
          <section 
            style={{ height: `${hauteurAffichee}px` }}
            className="order-2 xl:order-2 bg-emerald-900/5 border-2 border-emerald-100 rounded-3xl p-6 overflow-auto shadow-inner relative"
          >
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hauteurContenu} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={p.noeud.id}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#10b981" strokeWidth="2" strokeDasharray="6 4"
                      />
                    )}
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                      <div className="h-full w-full bg-white border-2 border-emerald-800 rounded-2xl p-4 shadow-lg flex flex-col justify-center text-center relative hover:scale-105 transition-transform duration-300">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                          Rang {i + 1}
                        </div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{p.noeud.section}</p>
                        <h4 className="text-[15px] font-black text-slate-900 leading-tight tracking-tight uppercase">{p.noeud.titre}</h4>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </section>

        </div>
      )}

      
    </main>
  );
}