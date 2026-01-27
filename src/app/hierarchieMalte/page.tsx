"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, Building2 } from "lucide-react";

/* =========================
    TYPES
========================= */

interface Personne {
  personne: string;
  institution?: string;
  lieu?: string;
  superieur?: string | null;
  enfants?: Personne[];
}

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

/* =========================
    ORDRES & CONFIG
========================= */

const ORDRES = [
  {
    titre: "Ordre Militaire",
    items: ['Commanderie hospitalière','Baillie hospitalière','Langues hospitalières','Grand Prieuré hospitalier','Prieuré hospitalier','chapellenie hospitalière','maisons hospitalières','Moine-soldat','Marine']
  },
  {
    titre: "Hôspitaliers",
    items: ['Hôspitaliers','Grand hospitalier','supérieur régional','commandeur','bailli','pilier','grand prieur','prieur','chapelain','sergent d\'arme','Chevalier-Hospitalier','Frère hospitalier','amrial','officiers','capitaine','chevalier','frère']
  },
  {
    titre: "Ordre de Malte",
    items: ['Première classe','Chevaliers de justice','Chapelains conventuels','Deuxième classe','Chevaliers et dames d\'honneur et de dévotion en obédience','Chevaliers et dames de grâce et de dévotion en obédience','Chevaliers et dames de grâce magistrale en obédience','Troisième classe','Chevaliers et dames d\'honneur et de dévotion','Chapelains conventuels ad honorem','Chevaliers et dames de grâce et de dévotion','Chapelains magistraux','Diacres magistraux','Chevaliers et dames de grâce magistrale','Donats et donates de dévotion']
  }
];

const LARGEUR_NOEUD = 240;
const HAUTEUR_NOEUD = 80;
const ESPACE_V = 40;

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
    COMPOSANT SECTION
========================= */

function SectionMalte({ titre, items, data }: { titre: string, items: string[], data: Personne[] }) {
  // Construire la branche linéaire pour cette section
  const sectionNodes = items.map(name => {
    const found = data.find(p => p.personne === name);
    return { 
      personne: name, 
      institution: found?.institution || '-', 
      lieu: found?.lieu || '-', 
      superieur: found?.superieur || '-',
      enfants: [] 
    } as Personne;
  });

  for (let i = 0; i < sectionNodes.length - 1; i++) {
    sectionNodes[i].enfants = [sectionNodes[i + 1]];
  }

  const positions: Position[] = [];
  const hMax = sectionNodes.length > 0 ? calculLayout(sectionNodes[0], 10, 20, positions) + HAUTEUR_NOEUD + 40 : 200;

  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-1 bg-red-600 rounded-full"></div>
        <h2 className="text-2xl font-bold text-slate-800">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* TABLEAU À GAUCHE */}
        <div className="order-2 xl:order-1 overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3 border-b">Rang</th>
                <th className="px-4 py-3 border-b">Désignation</th>
                <th className="px-4 py-3 border-b">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionNodes.map((node, idx) => (
                <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-4 py-4 font-mono text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{node.personne}</div>
                    <div className="text-[10px] text-red-600 font-semibold">{node.institution}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1"><MapPin size={10}/> {node.lieu}</div>
                    <div className="mt-1 opacity-70">Sup: {node.superieur}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ARBRE À DROITE */}
        <div className="order-1 xl:order-2 bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-[600px] shadow-inner">
          <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto">
            {positions.map((p, i) => (
              <g key={i}>
                {i < positions.length - 1 && (
                  <line 
                    x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                    x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                    stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2"
                  />
                )}
                <rect x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} rx={6} fill="white" stroke="#dc2626" strokeWidth="1.5" />
                <text x={p.x + 12} y={p.y + 25} fontSize="10" fontWeight="bold" fill="#dc2626" className="uppercase tracking-tighter">
                  {p.noeud.institution?.slice(0, 30)}
                </text>
                <text x={p.x + 12} y={p.y + 50} fontSize="13" fontWeight="800" fill="#1e293b">
                  {p.noeud.personne}
                </text>
                <circle cx={p.x + LARGEUR_NOEUD/2} cy={p.y + HAUTEUR_NOEUD} r={3} fill="#dc2626" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* =========================
    PAGE
========================= */

export default function HierarchieMaltePage() {
  const [data, setData] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hierarchieMalte')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="p-6 min-h-screen bg-slate-50/30">
      <nav className="mb-8 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-4 flex justify-center items-center gap-4">
          <ShieldCheck size={44} className="text-red-600" />
          <span className="uppercase tracking-tight">Souverain Ordre de Malte</span>
        </h1>
        <p className="text-slate-500 italic">Organisation hiérarchique, militaire et hospitalière</p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="h-1 w-8 bg-red-600 rounded-full"></span>
          <span className="h-1 w-24 bg-red-600 rounded-full"></span>
          <span className="h-1 w-8 bg-red-600 rounded-full"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-400">Chargement des archives de l'Ordre...</div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {ORDRES.map((o, idx) => (
            <SectionMalte key={idx} titre={o.titre} items={o.items} data={data} />
          ))}
        </div>
      )}
    </main>
  );
}
