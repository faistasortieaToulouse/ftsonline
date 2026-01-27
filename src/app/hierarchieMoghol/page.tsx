"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

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
    COMPOSANT ARBRE SVG
========================= */

const LARGEUR_NOEUD = 260;
const HAUTEUR_NOEUD = 80;
const ESPACE_VERTICAL = 50;

function calculLayoutVertical(
  noeud: Personne,
  x: number,
  y: number,
  positions: Position[]
): number {
  positions.push({ x, y, noeud });
  let currentY = y;

  if (noeud.enfants && noeud.enfants.length > 0) {
    noeud.enfants.forEach((enfant) => {
      const nextY = currentY + HAUTEUR_NOEUD + ESPACE_VERTICAL;
      currentY = calculLayoutVertical(enfant, x, nextY, positions);
    });
  }
  return currentY;
}

/* =========================
    PAGE PRINCIPALE
========================= */

export default function HierarchieMogholPage() {
  const [arbre, setArbre] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hierarchieMoghol')
      .then(res => res.json())
      .then((data: Personne[]) => {
        if (!data || data.length === 0) return;

        // Construction de la structure linéaire (Parent -> Enfant)
        const nodes = data.map(d => ({ ...d, enfants: [] }));
        for (let i = 0; i < nodes.length - 1; i++) {
          nodes[i].enfants = [nodes[i + 1]];
        }

        setArbre([nodes[0]]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Calcul des positions pour le SVG
  const positions: Position[] = [];
  let hauteurMax = 500;
  if (arbre.length > 0) {
    const finalY = calculLayoutVertical(arbre[0], 20, 20, positions);
    hauteurMax = finalY + HAUTEUR_NOEUD + 40;
  }

  return (
    <main className="p-6 min-h-screen bg-white">
      <nav className="mb-6 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-12 text-center max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-4 flex justify-center items-center gap-4">
          <Landmark size={40} className="text-emerald-600" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600 uppercase">
            Hiérarchie Moghol
          </span>
        </h1>
        <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full"></div>
        <p className="mt-4 text-slate-500 font-medium italic">Structure administrative et titres de l'Empire de l'Inde</p>
      </header>

      {loading ? (
        <div className="text-center py-20 italic text-slate-400">Ouverture des chroniques impériales...</div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLONNE GAUCHE : Tableau */}
          <section className="order-2 lg:order-1 bg-white border border-emerald-100 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
              <h3 className="text-emerald-800 font-bold uppercase text-xs tracking-widest text-center">Registres des Titres</h3>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-center">Rang</th>
                    <th className="px-4 py-3">Titre (Ourdou)</th>
                    <th className="px-4 py-3">Fonction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {positions.map((p) => (
                    <tr key={p.noeud.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-emerald-700">{p.noeud.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{p.noeud.titre}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase">{p.noeud.section}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 leading-relaxed italic">{p.noeud.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* COLONNE DROITE : Arbre SVG */}
          <section className="order-1 lg:order-2 bg-emerald-50/30 rounded-xl border border-emerald-100 p-4 shadow-inner max-h-[750px] overflow-auto">
            <svg width={LARGEUR_NOEUD + 40} height={hauteurMax} className="mx-auto">
              {/* Liens parent-enfant */}
              {positions.map((parent) =>
                parent.noeud.enfants?.map((enfant) => {
                  const enfantPos = positions.find((p) => p.noeud.id === enfant.id);
                  if (!enfantPos) return null;
                  return (
                    <g key={`${parent.noeud.id}-${enfant.id}`}>
                      <line
                        x1={parent.x + LARGEUR_NOEUD / 2}
                        y1={parent.y + HAUTEUR_NOEUD}
                        x2={enfantPos.x + LARGEUR_NOEUD / 2}
                        y2={enfantPos.y}
                        stroke="#059669"
                        strokeWidth="2"
                        strokeDasharray="5"
                      />
                      <circle cx={enfantPos.x + LARGEUR_NOEUD / 2} cy={enfantPos.y} r={4} fill="#059669" />
                    </g>
                  );
                })
              )}

              {/* Nœuds */}
              {positions.map((p) => (
                <g key={p.noeud.id}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={LARGEUR_NOEUD}
                    height={HAUTEUR_NOEUD}
                    rx={12}
                    fill="white"
                    stroke="#064e3b"
                    strokeWidth="1.5"
                    className="drop-shadow-sm"
                  />
                  <text x={p.x + 15} y={p.y + 25} fontSize={10} fontWeight="bold" fill="#059669" className="uppercase tracking-widest">
                    {p.noeud.section}
                  </text>
                  <text x={p.x + 15} y={p.y + 50} fontSize={15} fontWeight="900" fill="#0f172a">
                    {p.noeud.titre}
                  </text>
                  <rect x={p.x + LARGEUR_NOEUD - 35} y={p.y + 10} width={25} height={18} rx={4} fill="#ecfdf5" />
                  <text x={p.x + LARGEUR_NOEUD - 28} y={p.y + 22} fontSize={10} fontWeight="bold" fill="#059669">
                    {p.noeud.id}
                  </text>
                </g>
              ))}
            </svg>
          </section>

        </div>
      )}
    </main>
  );
}
