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

const LARGEUR_NOEUD = 260; // Légèrement élargi pour Malte
const HAUTEUR_NOEUD = 100; // Hauteur fixe pour le multi-ligne
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
    <div className="mb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
        {/* TABLEAU */}
        <div className="order-2 xl:order-1 overflow-hidden border border-slate-200 rounded-2xl shadow-xl bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Rang</th>
                <th className="px-6 py-4">Désignation</th>
                <th className="px-6 py-4">Localisation & Supérieur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionNodes.map((node, idx) => (
                <tr key={idx} className="hover:bg-red-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 leading-tight mb-1">{node.personne}</div>
                    <div className="text-[10px] text-red-600 font-bold uppercase">{node.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1 font-medium"><MapPin size={12} className="text-red-500"/> {node.lieu}</div>
                    <div className="mt-1 opacity-70">Sup: {node.superieur}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ARBRE AVEC FOREIGN OBJECT */}
        <div className="order-1 xl:order-2 bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 overflow-auto max-h-[700px] shadow-inner">
          <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto">
            {positions.map((p, i) => (
              <g key={i}>
                {i < positions.length - 1 && (
                  <path 
                    d={`M ${p.x + LARGEUR_NOEUD/2} ${p.y + HAUTEUR_NOEUD} L ${p.x + LARGEUR_NOEUD/2} ${positions[i+1].y}`} 
                    stroke="#dc2626" strokeWidth="2" fill="none" strokeDasharray="5 5"
                  />
                )}
                
                <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD}>
                  <div className="w-full h-full bg-white border-2 border-red-600 rounded-xl p-3 shadow-md flex flex-col justify-center text-center">
                    <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest mb-1 truncate">
                      {p.noeud.institution}
                    </p>
                    <h4 className="text-[12px] font-black text-slate-900 leading-tight">
                      {p.noeud.personne}
                    </h4>
                    {p.noeud.lieu !== '-' && (
                      <p className="text-[9px] text-slate-400 mt-1 italic">
                        {p.noeud.lieu}
                      </p>
                    )}
                  </div>
                </foreignObject>

                <circle cx={p.x + LARGEUR_NOEUD/2} cy={p.y + HAUTEUR_NOEUD} r={4} fill="#dc2626" />
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
    <main className="p-8 min-h-screen bg-slate-50">
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-20 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ShieldCheck size={60} className="text-red-600" />
            <div className="absolute inset-0 animate-ping opacity-20 bg-red-600 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
          SOUVERAIN ORDRE DE MALTE
        </h1>
        <p className="text-slate-500 font-medium italic text-lg tracking-wide">
          Organisation hospitalière, militaire et religieuse
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <span className="h-1.5 w-12 bg-red-600 rounded-full"></span>
          <span className="h-1.5 w-12 bg-slate-200 rounded-full"></span>
          <span className="h-1.5 w-12 bg-red-600 rounded-full"></span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Extraction des registres hospitaliers...</p>
        </div>
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
