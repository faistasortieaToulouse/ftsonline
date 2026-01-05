"use client";

import { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */

type Noeud = {
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  niveau_equivalent: string | null;
  enfants?: Noeud[];
};

type Position = {
  x: number;
  y: number;
  noeud: Noeud;
};

/* =========================
   COMPOSANT LISTE (GAUCHE)
========================= */

function NoeudHierarchie({ noeud }: { noeud: Noeud }) {
  return (
    <li className="ml-4 border-l pl-4 mt-2">
      <div className="font-semibold">{noeud.personne}</div>
      <div className="text-sm text-gray-600">
        {noeud.institution} – {noeud.lieu}
      </div>
      {noeud.niveau_equivalent && (
        <div className="text-xs italic text-gray-500">
          Équivalent : {noeud.niveau_equivalent}
        </div>
      )}

      {noeud.enfants && noeud.enfants.length > 0 && (
        <ul className="mt-2">
          {noeud.enfants.map((enfant) => (
            <NoeudHierarchie key={enfant.personne} noeud={enfant} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* =========================
   ARBRE SVG (DROITE)
========================= */

const LARGEUR_NOEUD = 220;
const HAUTEUR_NOEUD = 50;
const ESPACE_HORIZONTAL = 60;
const ESPACE_VERTICAL = 90;

function calculLayout(
  noeud: Noeud,
  x: number,
  y: number,
  positions: Position[]
): number {
  const debutY = y;

  if (noeud.enfants && noeud.enfants.length > 0) {
    noeud.enfants.forEach((enfant) => {
      y = calculLayout(
        enfant,
        x + LARGEUR_NOEUD + ESPACE_HORIZONTAL,
        y,
        positions
      );
    });
  }

  const centreY =
    noeud.enfants && noeud.enfants.length > 0
      ? (debutY + y - ESPACE_VERTICAL) / 2
      : y;

  positions.push({ x, y: centreY, noeud });

  return y + ESPACE_VERTICAL;
}

function ArbreSVG({ racine }: { racine: Noeud }) {
  const positions: Position[] = [];

  // Constantes de layout
  const ESPACE_HORIZONTAL = 60;
  const ESPACE_VERTICAL = 40;
  const PADDING_X = 20;
  const PADDING_Y = 20;
  const FONT_SIZE = 14;
  const LINE_HEIGHT = 16;

  // Fonction utilitaire pour ajuster la taille d'un nœud
  function ajusterNoeud(text: string) {
    const lines = text.split("\n");
    const width = Math.max(...lines.map((line) => line.length * (FONT_SIZE * 0.6))) + PADDING_X;
    const height = lines.length * LINE_HEIGHT + PADDING_Y;
    return { width, height };
  }

  // Layout récursif
  function layout(noeud: Noeud, x: number, y: number, positions: Position[]): number {
    const debutY = y;
    let maxY = y;

    if (noeud.enfants && noeud.enfants.length > 0) {
      noeud.enfants.forEach((enfant) => {
        maxY = layout(enfant, x + 200 + ESPACE_HORIZONTAL, maxY, positions);
      });
    }

    const { height } = ajusterNoeud(noeud.personne);
    const centreY = (debutY + maxY - ESPACE_VERTICAL) / 2;

    positions.push({ x, y: centreY, noeud });
    return maxY + height + ESPACE_VERTICAL;
  }

  // Calcul des positions
  layout(racine, 20, 40, positions);

  // Calcul de la taille totale du SVG
  const largeurMax = Math.max(...positions.map((p) => ajusterNoeud(p.noeud.personne).width + p.x)) + 50;
  const hauteurMax = Math.max(...positions.map((p) => ajusterNoeud(p.noeud.personne).height + p.y)) + 50;

  return (
    <svg width={largeurMax} height={hauteurMax} className="bg-white">
      {/* Liens parent → enfants */}
      {positions.map((parent) =>
        parent.noeud.enfants?.map((enfant) => {
          const enfantPos = positions.find((p) => p.noeud.personne === enfant.personne);
          if (!enfantPos) return null;
          const { height: parentHeight } = ajusterNoeud(parent.noeud.personne);
          const { height: enfantHeight } = ajusterNoeud(enfant.personne);

          return (
            <line
              key={`${parent.noeud.personne}-${enfant.personne}`}
              x1={parent.x + ajusterNoeud(parent.noeud.personne).width}
              y1={parent.y + parentHeight / 2}
              x2={enfantPos.x}
              y2={enfantPos.y + enfantHeight / 2}
              stroke="#334155"
            />
          );
        })
      )}

      {/* Nœuds */}
      {positions.map(p => {
        // Cas spécial pour Promoteur / Défenseur du lien
        let { width, height } = ajusterNoeud(p.noeud.personne);
        let lines = p.noeud.personne.split(" ou ");

        if (p.noeud.personne === "Promoteur de justice ou Défenseur du lien") {
          lines = ["Promoteur de justice", "Défenseur du lien"];
          width = 250;
          height = 60;
        }

        return (
          <g key={p.noeud.personne}>
            <rect x={p.x} y={p.y} width={width} height={height} rx={10} fill="#f8fafc" stroke="#0f172a" />
            {lines.map((line, i) => (
              <text key={i} x={p.x + 10} y={p.y + 20 + i * LINE_HEIGHT} fontSize={FONT_SIZE} fill="#0f172a">
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}



/* =========================
   PAGE PRINCIPALE
========================= */

export default function HierarchiePapePage() {
  const [arbre, setArbre] = useState<Noeud[]>([]);

  useEffect(() => {
    fetch("/api/hierarchiePape")
      .then((res) => res.json())
      .then(setArbre);
  }, []);

  return (
    <main className="p-6 h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Hiérarchie du Saint-Siège
      </h1>

      <div className="grid grid-cols-2 gap-6 h-[calc(100%-4rem)]">
        {/* GAUCHE */}
        <section className="overflow-auto border-r pr-4">
          <ul>
            {arbre.map((racine) => (
              <NoeudHierarchie key={racine.personne} noeud={racine} />
            ))}
          </ul>
        </section>

        {/* DROITE */}
        <section className="overflow-auto">
          {arbre[0] && <ArbreSVG racine={arbre[0]} />}
        </section>
      </div>
    </main>
  );
}
