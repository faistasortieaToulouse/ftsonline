"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* =========================
   TYPES
========================= */

type NoeudPerse = {
  id: number;
  section: string;
  titre: string;
  description: string;
  enfants?: NoeudPerse[];
};

type Position = {
  x: number;
  y: number;
  noeud: NoeudPerse;
};

/* =========================
   COMPOSANT LISTE (GAUCHE)
========================= */

function NoeudHierarchie({ noeud }: { noeud: NoeudPerse }) {
  return (
    <li className="ml-4 border-l pl-4 mt-2">
      <div className="font-semibold">{noeud.titre}</div>
      <div className="text-sm text-gray-600">{noeud.description}</div>
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

const LARGEUR_NOEUD = 220;
const HAUTEUR_NOEUD = 60;
const ESPACE_VERTICAL = 80;
const ESPACE_HORIZONTAL = 40;

function calculLayoutVertical(
  noeud: NoeudPerse,
  x: number,
  y: number,
  positions: Position[]
): number {
  positions.push({ x, y, noeud });
  let maxY = y;

  if (noeud.enfants && noeud.enfants.length > 0) {
    const nextY = y + HAUTEUR_NOEUD + ESPACE_VERTICAL;
    maxY = calculLayoutVertical(noeud.enfants[0], x, nextY, positions);
  }

  return maxY;
}

function ArbreSVGVertical({ racine }: { racine: NoeudPerse }) {
  const positions: Position[] = [];
  const startX = 50;
  const startY = 20;

  calculLayoutVertical(racine, startX, startY, positions);

  const largeurMax = Math.max(...positions.map((p) => p.x + LARGEUR_NOEUD)) + 50;
  const hauteurMax = Math.max(...positions.map((p) => p.y + HAUTEUR_NOEUD)) + 50;

  return (
    <svg width={largeurMax} height={hauteurMax} className="bg-white">
      {/* Liens parent → enfants */}
      {positions.map((parent) =>
        parent.noeud.enfants?.map((enfant) => {
          const enfantPos = positions.find((p) => p.noeud.id === enfant.id);
          if (!enfantPos) return null;
          return (
            <line
              key={`${parent.noeud.id}-${enfant.id}`}
              x1={parent.x + LARGEUR_NOEUD / 2}
              y1={parent.y + HAUTEUR_NOEUD}
              x2={enfantPos.x + LARGEUR_NOEUD / 2}
              y2={enfantPos.y}
              stroke="#334155"
            />
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
            rx={10}
            fill="#f8fafc"
            stroke="#0f172a"
          />
          <text x={p.x + 10} y={p.y + 30} fontSize={14} fill="#0f172a">
            {p.noeud.titre}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* =========================
   PAGE PRINCIPALE
========================= */

export default function HierarchiePersePage() {
  const [arbre, setArbre] = useState<NoeudPerse[]>([]);

  useEffect(() => {
    fetch("/api/hierarchiePerse")
      .then((res) => res.json())
      .then((data: NoeudPerse[]) => {
        if (data.length === 0) return;

        // Construire un arbre vertical linéaire : chaque nœud → enfant suivant
        for (let i = 0; i < data.length - 1; i++) {
          data[i].enfants = [data[i + 1]];
        }
        data[data.length - 1].enfants = [];

        setArbre([data[0]]); // racine
      });
  }, []);

  return (
    <main className="p-6 h-screen">
       
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
       
      <h1 className="text-2xl font-bold mb-6">Hiérarchie de l'Empire Perse</h1>

      <div className="grid grid-cols-2 gap-6 h-[calc(100%-4rem)]">
        {/* GAUCHE : liste hiérarchique */}
        <section className="overflow-auto border-r pr-4">
          <ul>
            {arbre.map((racine) => (
              <NoeudHierarchie key={racine.id} noeud={racine} />
            ))}
          </ul>
        </section>

        {/* DROITE : arbre SVG vertical */}
        <section className="overflow-auto">
          {arbre[0] && <ArbreSVGVertical racine={arbre[0]} />}
        </section>
      </div>
    </main>
  );
}
