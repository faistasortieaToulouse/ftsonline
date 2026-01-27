"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";

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
    ARBRE SVG VERTICAL
========================= */

const LARGEUR_NOEUD = 280;
const HAUTEUR_NOEUD = 70;
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

function ArbreSVGVertical({ racine, sectionNom }: { racine: Personne, sectionNom: string }) {
  const positions: Position[] = [];
  const finalY = calculLayoutVertical(racine, 10, 20, positions);

  const largeurMax = LARGEUR_NOEUD + 20;
  const hauteurMax = finalY + HAUTEUR_NOEUD + 40;

  return (
    <div className="mb-12 bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Crown className="text-amber-500" size={24} /> {sectionNom}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLONNE GAUCHE : Tableau détaillé */}
        <div className="overflow-auto max-h-[600px] border rounded-lg bg-white shadow-sm order-2 lg:order-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs sticky top-0 border-b">
              <tr>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {positions.map((p) => (
                <tr key={p.noeud.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-900">{p.noeud.titre}</td>
                  <td className="px-4 py-3 text-slate-600 leading-relaxed italic">{p.noeud.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COLONNE DROITE : Visualisation SVG */}
        <div className="overflow-auto bg-white rounded-lg border border-slate-100 p-4 shadow-inner max-h-[600px] order-1 lg:order-2">
          <svg width={largeurMax} height={hauteurMax} className="mx-auto">
            {positions.map((parent) =>
              parent.noeud.enfants?.map((enfant) => {
                const enfantPos = positions.find((p) => p.noeud.id === enfant.id);
                if (!enfantPos) return null;
                return (
                  <g key={`${parent.noeud.id}-${enfant.id}`}>
                    <path
                      d={`M ${parent.x + LARGEUR_NOEUD / 2} ${parent.y + HAUTEUR_NOEUD} 
                          L ${enfantPos.x + LARGEUR_NOEUD / 2} ${enfantPos.y}`}
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4"
                    />
                  </g>
                );
              })
            )}
            {positions.map((p) => (
              <g key={p.noeud.id}>
                <rect
                  x={p.x}
                  y={p.y}
                  width={LARGEUR_NOEUD}
                  height={HAUTEUR_NOEUD}
                  rx={8}
                  fill="white"
                  stroke="#1e3a8a"
                  strokeWidth="1.5"
                />
                <text x={p.x + 15} y={p.y + 25} fontSize={10} fontWeight="bold" fill="#3b82f6" className="uppercase tracking-widest">
                  {p.noeud.section.split(' ').slice(0, 2).join(' ')}
                </text>
                <text x={p.x + 15} y={p.y + 45} fontSize={14} fontWeight="800" fill="#1e293b">
                  {p.noeud.titre}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* =========================
    PAGE PRINCIPALE
========================= */

export default function HierarchieNoblessePage() {
  const [sectionsArbres, setSectionsArbres] = useState<Record<string, Personne[]>>({});
  const [loading, setLoading] = useState(true);

  const arbreSections = [
    'Titres Souverains',
    'Dignité Héréditaire',
    'Grands Officiers de la Couronne',
    'Grands Officiers de la Maison',
    'Titres de Noblesse',
    'Haute Fonction d\'Etat',
    'Petite Noblesse'
  ];

  useEffect(() => {
    fetch('/api/hierarchieNoblesse')
      .then(res => res.json())
      .then((data: Personne[]) => {
        const result: Record<string, Personne[]> = {};

        arbreSections.forEach(secNom => {
          const filtered = data.filter(p => p.section.startsWith(secNom));
          if (filtered.length > 0) {
            const nodes = filtered.map(d => ({ ...d, enfants: [] }));
            for (let i = 0; i < nodes.length - 1; i++) {
              nodes[i].enfants = [nodes[i + 1]];
            }
            result[secNom] = [nodes[0]];
          }
        });

        setSectionsArbres(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6 min-h-screen bg-white">
      <nav className="mb-6 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-12 text-center max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-4 flex justify-center items-center gap-4">
          <Crown size={40} className="text-amber-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 uppercase">
            Hiérarchie de la Noblesse
          </span>
        </h1>
        <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full"></div>
        <p className="mt-4 text-slate-500 font-medium italic">Organisation des rangs, titres et dignités de la Couronne</p>
      </header>

      {loading ? (
        <div className="text-center py-20 italic text-slate-400 animate-pulse">
          Ouverture des registres de la Noblesse...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {arbreSections.map(section => (
            sectionsArbres[section] && (
              <ArbreSVGVertical 
                key={section} 
                racine={sectionsArbres[section][0]} 
                sectionNom={section} 
              />
            )
          ))}
        </div>
      )}
    </main>
  );
}
