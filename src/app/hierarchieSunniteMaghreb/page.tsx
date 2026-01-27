"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* =========================
    TYPES
========================= */

type NoeudSunniteMaghreb = {
  id: number;
  section: string;
  titre: string;
  description: string;
  enfants?: NoeudSunniteMaghreb[];
};

type Position = {
  x: number;
  y: number;
  noeud: NoeudSunniteMaghreb;
};

/* =========================
    COMPOSANT LISTE (GAUCHE)
========================= */

function NoeudHierarchie({ noeud }: { noeud: NoeudSunniteMaghreb }) {
  return (
    <li className="ml-4 border-l border-emerald-200 pl-4 mt-4">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">
          {noeud.section}
        </span>
        <span className="font-bold text-lg text-slate-900">{noeud.titre}</span>
        <p className="text-sm text-slate-600 leading-relaxed italic">
          {noeud.description}
        </p>
      </div>
      {noeud.enfants && noeud.enfants.length > 0 && (
        <ul className="mt-2">
          {noeud.enfants.map((enfant) => (
            <NoeudHierarchie key={enfant.id} noeud={enfant} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* =========================
    ARBRE SVG VERTICAL (DROITE)
========================= */

const LARGEUR_NOEUD = 260;
const HAUTEUR_NOEUD = 80;
const ESPACE_VERTICAL = 60;

// CORRECTION : Parcours récursif de TOUS les enfants
function calculLayoutVertical(
  noeud: NoeudSunniteMaghreb,
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

function ArbreSVGVertical({ racine }: { racine: NoeudSunniteMaghreb }) {
  const positions: Position[] = [];
  const startX = 20;
  const startY = 20;

  // Calcule les positions et récupère la hauteur maximale réelle
  const finalY = calculLayoutVertical(racine, startX, startY, positions);

  const largeurMax = LARGEUR_NOEUD + 40;
  const hauteurMax = finalY + HAUTEUR_NOEUD + 40; // Hauteur dynamique

  return (
    <div className="bg-emerald-50/30 rounded-xl border border-emerald-100 shadow-inner p-4 overflow-auto h-full">
      <svg 
        width={largeurMax} 
        height={hauteurMax} 
        className="mx-auto"
        viewBox={`0 0 ${largeurMax} ${hauteurMax}`}
      >
        {/* Liens parent → enfants */}
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
                  stroke="#10b981" // Couleur émeraude
                  strokeWidth="2"
                  strokeDasharray="4"
                />
                <polygon 
                  points={`${enfantPos.x + LARGEUR_NOEUD / 2 - 5},${enfantPos.y} ${enfantPos.x + LARGEUR_NOEUD / 2 + 5},${enfantPos.y} ${enfantPos.x + LARGEUR_NOEUD / 2},${enfantPos.y + 8}`}
                  fill="#10b981"
                />
              </g>
            );
          })
        )}

        {/* Nœuds */}
        {positions.map((p) => (
          <g key={p.noeud.id} className="drop-shadow-sm">
            <rect
              x={p.x}
              y={p.y}
              width={LARGEUR_NOEUD}
              height={HAUTEUR_NOEUD}
              rx={12}
              fill="white"
              stroke="#064e3b"
              strokeWidth="1.5"
            />
            <text x={p.x + 15} y={p.y + 25} fontSize={10} fontWeight="bold" fill="#059669" className="uppercase tracking-tighter">
              {p.noeud.section}
            </text>
            <text x={p.x + 15} y={p.y + 50} fontSize={15} fontWeight="800" fill="#0f172a">
              {p.noeud.titre}
            </text>
            <circle cx={p.x + LARGEUR_NOEUD - 20} cy={p.y + 20} r={8} fill="#ecfdf5" />
            <text x={p.x + LARGEUR_NOEUD - 23} y={p.y + 24} fontSize={9} fontWeight="bold" fill="#059669">
              {p.noeud.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================
    PAGE PRINCIPALE
========================= */

export default function HierarchieSunniteMaghrebPage() {
  const [arbre, setArbre] = useState<NoeudSunniteMaghreb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hierarchieSunniteMaghreb")
      .then((res) => res.json())
      .then((data: NoeudSunniteMaghreb[]) => {
        if (!data || data.length === 0) return;

        // Transformation en chaîne linéaire (chaque élément vers le suivant)
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

  return (
    <main className="p-6 h-screen flex flex-col bg-white overflow-hidden">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b border-emerald-100 pb-4">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          🕌 <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-900">Hiérarchie Sunnite Maghreb</span>
        </h1>
        <p className="text-slate-500 font-medium">Structure des autorités religieuses et politiques</p>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center italic text-slate-400">
          Chargement de l'arbre...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100%-8rem)]">
          <section className="overflow-auto pr-4 scrollbar-thin scrollbar-thumb-emerald-200">
            <h3 className="text-sm font-bold text-emerald-400 uppercase mb-4 tracking-widest">Détails des titres</h3>
            <ul className="pb-10">
              {arbre.map((racine) => (
                <NoeudHierarchie key={racine.id} noeud={racine} />
              ))}
            </ul>
          </section>

          <section className="h-full overflow-hidden">
             <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest text-center">Schéma de la hiérarchie</h3>
            {arbre[0] && <ArbreSVGVertical racine={arbre[0]} />}
          </section>
        </div>
      )}
    </main>
  );
}
