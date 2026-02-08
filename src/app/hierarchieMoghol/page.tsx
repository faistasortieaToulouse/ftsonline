"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText, Gem } from "lucide-react";

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
    CONFIGURATIONS
========================= */
const LARGEUR_NOEUD = 260;
const HAUTEUR_NOEUD = 100;
const ESPACE_V = 60;

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

export default function HierarchieMogholPage() {
  const [arbre, setArbre] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];

  useEffect(() => {
    fetch('/api/hierarchieMoghol')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la consultation des chroniques");
        return res.json();
      })
      .then((data: Personne[]) => {
        if (data && data.length > 0) {
          // Construction de la lignée impériale (linéaire)
          const nodes = data.map(d => ({ ...d, enfants: [] }));
          for (let i = 0; i < nodes.length - 1; i++) {
            nodes[i].enfants = [nodes[i + 1]];
          }
          setArbre([nodes[0]]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Les manuscrits impériaux sont introuvables.");
        setLoading(false);
      });
  }, []);

  if (!loading && !error && arbre.length > 0) {
    calculLayout(arbre[0], 20, 30, positions);
  }

  const hMax = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 40;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f7f9f7]">
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-emerald-700">
          <Landmark size={48} className="drop-shadow-md" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🕌 Hiérarchie de l'Empire Moghol
        </h1>
        <p className="text-slate-500 italic font-serif text-sm">Structure administrative et titres de cour (Mansabdari)</p>
        <div className="mt-6 flex justify-center items-center gap-2">
          <span className="h-[1px] w-16 md:w-24 bg-emerald-200"></span>
          <Gem size={16} className="text-emerald-500" />
          <span className="h-[1px] w-16 md:w-24 bg-emerald-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-emerald-800 font-serif italic text-sm tracking-[0.2em] uppercase">
          Traduction des parchemins en ourdou...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-emerald-100 rounded-xl text-emerald-800 shadow-sm text-sm italic">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. TABLEAU DES TITRES (SCROLL INTERNE) */}
          <section className="order-1 xl:order-1 bg-white border-l-4 border-l-emerald-800 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
            <div className="bg-emerald-50/50 border-b p-4 flex items-center gap-2 flex-shrink-0">
              <ScrollText size={18} className="text-emerald-700" />
              <h3 className="text-emerald-900 font-bold uppercase text-[10px] tracking-widest">Registres des Mansabdars</h3>
            </div>
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-emerald-50/30 text-slate-500 uppercase text-[9px] font-bold sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left w-16">Rang</th>
                    <th className="px-6 py-4 text-left">Titre & Section</th>
                    <th className="px-6 py-4 text-left">Description de la Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {positions.map((p) => (
                    <tr key={p.noeud.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-6 py-6 font-bold text-emerald-700 bg-emerald-50/10 text-xs text-center">{p.noeud.id}</td>
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-900 text-xs md:text-sm">{p.noeud.titre}</div>
                        <div className="text-[9px] text-emerald-600 font-bold uppercase mt-1 tracking-wider">{p.noeud.section}</div>
                      </td>
                      <td className="px-6 py-6 text-slate-600 text-[11px] md:text-xs leading-relaxed italic font-serif">
                        {p.noeud.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. ARBRE VISUEL (SCROLL INTERNE) */}
          <section className="order-2 xl:order-2 bg-[#f0f4f0] border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto h-[750px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={p.noeud.id}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#059669" strokeWidth="2" strokeDasharray="6 4"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                      <div className="h-full w-full bg-white border-2 border-emerald-800 rounded-xl p-3 shadow-md flex flex-col justify-center text-center transition-all hover:border-emerald-500 hover:shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-[8px] font-black px-3 py-1 rounded shadow-sm uppercase tracking-[0.2em]">
                          Zat {p.noeud.id}
                        </div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mb-1 truncate px-2">
                          {p.noeud.section}
                        </p>
                        <h4 className="text-[13px] font-black text-slate-900 leading-tight px-2">
                          {p.noeud.titre}
                        </h4>
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