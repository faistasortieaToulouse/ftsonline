"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Users, Briefcase, ScrollText, Cross } from "lucide-react";

/* =========================
    TYPES
========================= */
interface Personne {
  personne: string;
  institution: string;
  superieur: string | null;
  enfants?: Personne[];
}

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

/* =========================
    CONFIGURATIONS
========================= */
const ORDRES_CONFIG = [
  {
    titre: "Dignitaires",
    icon: <Star className="text-amber-500" />,
    items: ['Grand Maître','Baillis conventuels','Trésorier','Grand commandeur ou Grand précepteur','Grand hospitalier à la langue de France','Grand maréchal','Grand drapier','Grand hospitalier','Grand amiral','Turcoplier']
  },
  {
    titre: "Fonctions & Organisation",
    icon: <Briefcase className="text-blue-500" />,
    items: ['Frère prieur conventuel','Frère pilier','Frère commandeur','Frère bailli capitulaire','Frère prieur provincial','Les charges dans l\'Ordre','Officiers','Conseillers','Prud\'hommes','Commissaires','Les grands dignitaires','Grand Maître','Frère bailli conventuel','Les grands offices','Organisation de l\'Ordre','Les organes du pouvoir','Les frères chevaliers','Les sergents d\'armes','Les sergents d\'office','Frères prêtres / Chapelains conventuels']
  },
  {
    titre: "Classes & Statuts",
    icon: <Users className="text-emerald-500" />,
    items: ['Frères prêtres / Chapelains conventuels','Frères prêtres d\'obédience','Frères chevaliers profès','Frères chevaliers de grâce','Servants hospitaliers','Sergents d\'armes','Confrères donats (Grand\'croix, Demi-croix, Médaillers)','Nos seigneurs les malades','La familia','Les dépendants']
  }
];

const LARGEUR_NOEUD = 250;
const HAUTEUR_NOEUD = 100; 
const ESPACE_V = 60; // Espace entre les nœuds

/* =========================
    LOGIQUE DE CALCUL
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
function SectionJerusalem({ titre, icon, items, data }: { titre: string, icon: any, items: string[], data: Personne[] }) {
  const sectionNodes = items.map(name => {
    const found = data.find(p => p.personne === name);
    return { 
      personne: name, 
      institution: found?.institution || 'Ordre', 
      superieur: found?.superieur || '-',
      enfants: [] 
    } as Personne;
  });

  // Création de la chaîne hiérarchique visuelle
  for (let i = 0; i < sectionNodes.length - 1; i++) {
    sectionNodes[i].enfants = [sectionNodes[i + 1]];
  }

  const positions: Position[] = [];
  if (sectionNodes.length > 0) calculLayout(sectionNodes[0], 20, 30, positions);
  
  const hMax = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 60;

  return (
    <div className="mb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">{icon}</div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* 1. TABLEAU AVEC SCROLL INTERNE */}
        <div className="order-2 xl:order-1 bg-white border-l-4 border-l-blue-900 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[750px]">
          <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
            <ScrollText size={18} className="text-blue-900" />
            <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres de Terre Sainte</h3>
          </div>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left w-16 bg-slate-50">Rang</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Dignitaire</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Institution / Supérieur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionNodes.map((node, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-6 font-bold text-blue-900 bg-blue-50/20 text-xs text-center">{idx + 1}</td>
                    <td className="px-6 py-6 font-bold text-slate-900 text-xs md:text-sm">{node.personne}</td>
                    <td className="px-6 py-6">
                      <div className="text-[10px] font-bold text-blue-700 uppercase tracking-tighter">{node.institution}</div>
                      <div className="text-[9px] text-slate-400 italic mt-1 font-serif">Supérieur: {node.superieur}</div>
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
                      stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4"
                    />
                  )}
                  
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                    <div className="h-full w-full bg-white border-2 border-blue-600 rounded-xl p-3 shadow-md flex flex-col justify-center text-center transition-all hover:shadow-lg relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[8px] font-black px-3 py-1 rounded shadow-sm uppercase">
                        Rang {i + 1}
                      </div>
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mb-1 truncate px-2">
                        {p.noeud.institution}
                      </p>
                      <h4 className="text-[12px] font-extrabold text-slate-900 leading-tight px-2">
                        {p.noeud.personne}
                      </h4>
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
export default function HierarchieJerusalemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hierarchieJerusalem')
      .then(res => {
        if (!res.ok) throw new Error("Erreur de connexion aux archives");
        return res.json();
      })
      .then(d => { 
        if (d.error) setError(d.error);
        else setData(d); 
        setLoading(false); 
      })
      .catch(() => {
        setError("Impossible de joindre les archives de Jérusalem.");
        setLoading(false);
      });
  }, []);

  const allData = data ? [
    ...(data.hierarchie_dignitaires || []),
    ...(data.fonctions_et_organisation || []),
    ...(data.classes_et_statuts || [])
  ] : [];

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#fcfaf7]">
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-blue-900">
          <Cross size={48} className="drop-shadow-md" />
        </div>
        <h1 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
          Hiérarchie de Jérusalem
        </h1>
        <p className="text-slate-500 italic font-serif text-sm">Ordre Souverain et Militaire de la Terre Sainte</p>
        <div className="mt-6 flex justify-center items-center gap-2">
          <span className="h-[1px] w-16 md:w-24 bg-amber-400"></span>
          <div className="w-2 h-2 bg-amber-500 rotate-45"></div>
          <span className="h-[1px] w-16 md:w-24 bg-amber-400"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-24 text-blue-900 font-serif italic animate-pulse uppercase tracking-widest text-xs">
          Compilation des parchemins de Jérusalem...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {ORDRES_CONFIG.map((config, idx) => (
            <SectionJerusalem 
              key={idx} 
              titre={config.titre} 
              icon={config.icon} 
              items={config.items} 
              data={allData} 
            />
          ))}
        </div>
      )}
    </main>
  );
}