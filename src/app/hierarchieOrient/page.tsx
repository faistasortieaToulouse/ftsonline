"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* =========================
    TYPES
========================= */

type NoeudTemple = {
  id: number;
  section: string;
  titre: string;
  description: string;
  enfants?: NoeudTemple[];
};

type Position = {
  x: number;
  y: number;
  noeud: NoeudTemple;
};

/* =========================
    COMPOSANT LISTE (GAUCHE)
========================= */

function NoeudHierarchie({ noeud }: { noeud: NoeudTemple }) {
  return (
    <li className="ml-4 border-l border-red-200 pl-4 mt-4">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase text-red-600 tracking-wider">
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

function calculLayoutVertical(
  noeud: NoeudTemple,
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

function ArbreSVGVertical({ racine }: { racine: NoeudTemple }) {
  const positions: Position[] = [];
  const startX = 20;
  const startY = 20;

  const finalY = calculLayoutVertical(racine, startX, startY, positions);
  const largeurMax = LARGEUR_NOEUD + 40;
  const hauteurMax = finalY + HAUTEUR_NOEUD + 40;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-inner p-4 overflow-auto h-full">
      <svg width={largeurMax} height={hauteurMax} className="mx-auto" viewBox={`0 0 ${largeurMax} ${hauteurMax}`}>
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
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
                <polygon points={`${enfantPos.x + LARGEUR_NOEUD / 2 - 5},${enfantPos.y} ${enfantPos.x + LARGEUR_NOEUD / 2 + 5},${enfantPos.y} ${enfantPos.x + LARGEUR_NOEUD / 2},${enfantPos.y + 8}`} fill="#ef4444" />
              </g>
            );
          })
        )}

        {positions.map((p) => (
          <g key={p.noeud.id} className="drop-shadow-sm">
            <rect x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} rx={12} fill="white" stroke="#1e293b" strokeWidth="1.5" />
            <text x={p.x + 15} y={p.y + 25} fontSize={10} fontWeight="bold" fill="#ef4444" className="uppercase tracking-tighter">{p.noeud.section}</text>
            <text x={p.x + 15} y={p.y + 50} fontSize={14} fontWeight="800" fill="#0f172a">{p.noeud.titre}</text>
            <circle cx={p.x + LARGEUR_NOEUD - 20} cy={p.y + 20} r={8} fill="#fee2e2" />
            <text x={p.x + LARGEUR_NOEUD - 23} y={p.y + 24} fontSize={9} fontWeight="bold" fill="#b91c1c">{p.noeud.id}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =========================
    PAGE PRINCIPALE
========================= */

export default function HierarchieTemplePage() {
  const [arbreOccident, setArbreOccident] = useState<NoeudTemple[]>([]);
  const [arbreOrient, setArbreOrient] = useState<NoeudTemple[]>([]);
  const [loading, setLoading] = useState(true);

  // Données statiques basées sur vos ordres
  const ordreOccident = [
    { id: 1, section: "Commandement", titre: "Maître de l'Ordre", description: "Chef suprême de la milice." },
    { id: 2, section: "Visite", titre: "Maître en deçà-mer", description: "Visiteur général des provinces d'Occident." },
    { id: 3, section: "Province", titre: "Maître de province", description: "Dirige un pays ou une grande région." },
    { id: 4, section: "Baillie", titre: "Maître de baillie", description: "Responsable d'un district administratif." },
    { id: 5, section: "Logistique", titre: "Maître du passage", description: "Gère les embarquements vers la Terre Sainte." },
    { id: 6, section: "Maison", titre: "Commandeur de maison", description: "Précepteur d'une commanderie locale." },
    { id: 7, section: "Justice", titre: "Procureur", description: "Gère les litiges et les affaires juridiques." },
    { id: 8, section: "Clergé", titre: "Frères chapelains", description: "Prêtres de l'Ordre." },
    { id: 9, section: "Combat", titre: "Frères chevaliers", description: "L'élite combattante noble." },
    { id: 10, section: "Soutien", titre: "Frères sergents d'arme", description: "Combattants non-nobles." },
    { id: 11, section: "Artisanat", titre: "Frères de métier", description: "Maçons, forgerons, boulangers." },
    { id: 12, section: "Base", titre: "Serfs et serviteurs", description: "Personnel de service attaché à la maison." }
  ];

  const ordreOrient = [
    { id: 101, section: "Haute Direction", titre: "Grand Commandeur", description: "Second du Maître, gère le trésor." },
    { id: 102, section: "Commandement", titre: "Maître", description: "Le Grand Maître résidant en Terre Sainte." },
    { id: 103, section: "Palais", titre: "Sénéchal", description: "Remplace le Maître et gère l'intendance." },
    { id: 104, section: "Militaire", titre: "Maréchal", description: "Chef militaire suprême sur le terrain." },
    { id: 105, section: "Royaume", titre: "Commandeur de Jérusalem", description: "Gère les domaines du Royaume de Jérusalem." },
    { id: 106, section: "Logistique", titre: "Drapier", description: "Responsable de l'habillement et des équipements." },
    { id: 107, section: "Cité", titre: "Commandeur de la Cité", description: "Gouverneur de la ville sainte." },
    { id: 108, section: "Région", titre: "Commandeur de province", description: "Tripoli ou Antioche." },
    { id: 109, section: "Forteresse", titre: "Châtelains", description: "Gardiens des châteaux templiers." },
    { id: 110, section: "Cavalerie", titre: "Commandeur des chevaliers", description: "Dirige les frères chevaliers au combat." }
  ];

  useEffect(() => {
    // Transformer en arbres linéaires
    const formatArbre = (data: any[]) => {
      const nodes = data.map(d => ({ ...d, enfants: [] }));
      for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].enfants = [nodes[i + 1]];
      }
      return [nodes[0]];
    };

    setArbreOccident(formatArbre(ordreOccident));
    setArbreOrient(formatArbre(ordreOrient));
    setLoading(false);
  }, []);

  return (
    <main className="p-6 min-h-screen flex flex-col bg-white">
      <nav className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-8 border-b border-red-100 pb-4 text-center">
        <h1 className="text-3xl font-black text-slate-900">
          ⚔️ <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-slate-900">Hiérarchie de l'Ordre du Temple</span>
        </h1>
        <p className="text-slate-500 font-medium">Organisation des provinces d'Occident et de Terre Sainte</p>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center italic text-slate-400">Chargement de la milice...</div>
      ) : (
        <div className="space-y-16 pb-20">
          
          {/* SECTION OCCIDENT */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-red-600 pl-3">Province d'Occident</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
              <div className="overflow-auto pr-4 scrollbar-thin scrollbar-thumb-red-100">
                <ul className="pb-10">{arbreOccident.map(r => <NoeudHierarchie key={r.id} noeud={r} />)}</ul>
              </div>
              <div className="h-full overflow-hidden">
                <ArbreSVGVertical racine={arbreOccident[0]} />
              </div>
            </div>
          </section>

          {/* SECTION ORIENT */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-black pl-3">Terre Sainte (Orient)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
              <div className="overflow-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                <ul className="pb-10">{arbreOrient.map(r => <NoeudHierarchie key={r.id} noeud={r} />)}</ul>
              </div>
              <div className="h-full overflow-hidden">
                <ArbreSVGVertical racine={arbreOrient[0]} />
              </div>
            </div>
          </section>
          
        </div>
      )}
    </main>
  );
}
