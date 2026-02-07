"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, ScrollText, Cross } from "lucide-react";

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
    titre: "Hospitaliers",
    items: ['Hôspitaliers','Grand hospitalier','supérieur régional','commandeur','bailli','pilier','grand prieur','prieur','chapelain','sergent d\'arme','Chevalier-Hospitalier','Frère hospitalier','amrial','officiers','capitaine','chevalier','frère']
  },
  {
    titre: "Classes de l'Ordre",
    items: ['Première classe','Chevaliers de justice','Chapelains conventuels','Deuxième classe','Chevaliers et dames d\'honneur et de dévotion en obédience','Chevaliers et dames de grâce et de dévotion en obédience','Chevaliers et dames de grâce magistrale en obédience','Troisième classe','Chevaliers et dames d\'honneur et de dévotion','Chapelains conventuels ad honorem','Chevaliers et dames de grâce et de dévotion','Chapelains magistraux','Diacres magistraux','Chevaliers et dames de grâce magistrale','Donats et donates de dévotion']
  }
];

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
  if (sectionNodes.length > 0) calculLayout(sectionNodes[0], 20, 30, positions);
  
  const hMax = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 40;

  return (
    <div className="mb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* 1. TABLEAU AVEC SCROLL INTERNE */}
        <div className="order-2 xl:order-1 bg-white border-l-4 border-l-red-600 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
          <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
            <ScrollText size={18} className="text-red-600" />
            <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres Hospitaliers</h3>
          </div>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left w-16 bg-slate-50">Rang</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Désignation</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Localisation & Supérieur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionNodes.map((node, idx) => (
                  <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-6 font-mono text-slate-400 text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-slate-900 leading-tight text-xs md:text-sm">{node.personne}</div>
                      <div className="text-[10px] text-red-600 font-bold uppercase mt-1">{node.institution}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <MapPin size={12} className="text-red-500 flex-shrink-0"/> {node.lieu}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 italic font-serif">Sup: {node.superieur}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ARBRE AVEC SCROLL INTERNE */}
        <div className="order-1 xl:order-2 bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto h-[750px] shadow-inner relative">
          <div className="flex justify-center">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5"
                    />
                  )}
                  
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                    <div className="h-full w-full bg-white border-2 border-red-600 rounded-xl p-3 shadow-md flex flex-col justify-center text-center transition-all hover:border-red-400 hover:shadow-lg relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded shadow-sm uppercase tracking-widest">
                        Niveau {i + 1}
                      </div>
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 truncate px-2">
                        {p.noeud.institution}
                      </p>
                      <h4 className="text-[12px] font-black text-slate-900 leading-tight px-2">
                        {p.noeud.personne}
                      </h4>
                      {p.noeud.lieu !== '-' && (
                        <p className="text-[9px] text-slate-400 mt-1 italic font-serif px-2">
                          {p.noeud.lieu}
                        </p>
                      )}
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}

/* =========================
    PAGE PRINCIPALE
========================= */
export default function HierarchieMaltePage() {
  const [data, setData] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hierarchieMalte')
      .then(res => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(d => { 
        if (d.error) setError(d.error);
        else setData(d); 
        setLoading(false); 
      })
      .catch(() => {
        setError("Incapable d'ouvrir les registres de Malte.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-white">
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ShieldCheck size={64} className="text-red-600" />
            <div className="absolute inset-0 animate-ping opacity-10 bg-red-600 rounded-full"></div>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
          Souverain Ordre de Malte
        </h1>
        <p className="text-slate-500 font-serif italic text-base md:text-lg">
          Organisation hospitalière, militaire et religieuse
        </p>
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className="h-[2px] w-12 md:w-20 bg-red-600"></span>
          <Cross size={20} className="text-red-600 rotate-45" />
          <span className="h-[2px] w-12 md:w-20 bg-red-600"></span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] text-[10px]">Extraction des registres...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-red-50 border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
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