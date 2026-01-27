"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Users, Briefcase } from "lucide-react";

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

// On augmente la hauteur pour le confort du texte multi-ligne
const LARGEUR_NOEUD = 250;
const HAUTEUR_NOEUD = 100; 
const ESPACE_V = 40;

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

  for (let i = 0; i < sectionNodes.length - 1; i++) {
    sectionNodes[i].enfants = [sectionNodes[i + 1]];
  }

  const positions: Position[] = [];
  const hMax = sectionNodes.length > 0 ? calculLayout(sectionNodes[0], 10, 20, positions) + HAUTEUR_NOEUD + 40 : 200;

  return (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">{icon}</div>
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
        
        {/* TABLEAU */}
        <div className="order-2 xl:order-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h3 className="text-white text-xs font-bold uppercase tracking-widest">Registres de Jérusalem</h3>
          </div>
          <div className="overflow-auto max-h-[650px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="px-6 py-4 border-b">Rang</th>
                  <th className="px-6 py-4 border-b">Titre / Personne</th>
                  <th className="px-6 py-4 border-b">Institution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sectionNodes.map((node, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{node.personne}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 italic">Supérieur: {node.superieur}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                        {node.institution}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ARBRE AVEC TEXTE AUTOMATIQUE (FOREIGN OBJECT) */}
        <div className="order-1 xl:order-2 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-6 overflow-auto max-h-[650px]">
          <svg width={LARGEUR_NOEUD + 40} height={hMax} className="mx-auto">
            {positions.map((p, i) => (
              <g key={i}>
                {i < positions.length - 1 && (
                  <path 
                    d={`M ${p.x + LARGEUR_NOEUD/2} ${p.y + HAUTEUR_NOEUD} L ${p.x + LARGEUR_NOEUD/2} ${positions[i+1].y}`} 
                    stroke="#94a3b8" strokeWidth="2" fill="none" strokeDasharray="6 4"
                  />
                )}
                
                {/* Le ForeignObject permet au HTML/Tailwind de gérer le texte proprement */}
                <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD}>
                  <div className="w-full h-full bg-white border-2 border-blue-600 rounded-xl p-3 shadow-sm flex flex-col justify-center text-center">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter mb-1 truncate">
                      {p.noeud.institution}
                    </p>
                    <h4 className="text-[12px] font-extrabold text-slate-900 leading-tight">
                      {p.noeud.personne}
                    </h4>
                  </div>
                </foreignObject>

                <circle cx={p.x + LARGEUR_NOEUD/2} cy={p.y + HAUTEUR_NOEUD} r={4} fill="#2563eb" />
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

export default function HierarchieJerusalemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hierarchieJerusalem')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allData = data ? [
    ...data.hierarchie_dignitaires,
    ...data.fonctions_et_organisation,
    ...data.classes_et_statuts
  ] : [];

  return (
    <main className="p-8 min-h-screen bg-slate-50">
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      <header className="mb-20 text-center max-w-7xl mx-auto">
        <div className="inline-block p-2 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
          Archives de la Terre Sainte
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-6 flex justify-center items-center gap-5">
          <span className="text-amber-500 text-6xl">✡</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-900 to-slate-700">
            Hiérarchie de Jérusalem
          </span>
        </h1>
        <div className="h-1.5 w-32 bg-amber-400 mx-auto rounded-full"></div>
      </header>

      {loading ? (
        <div className="text-center py-24 text-slate-400 font-medium animate-pulse">
          Éveil des scribes et compilation des registres...
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
