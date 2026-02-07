"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Cross, ScrollText, ChevronRight } from "lucide-react";

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
    CONFIGURATIONS VISUELLES
========================= */
const LARGEUR_NOEUD = 260;
const HAUTEUR_NOEUD = 100;
const ESPACE_V = 60;
const HAUTEUR_MAX_SECTION = 700;

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(noeud: NoeudTemple, x: number, y: number, positions: Position[]): number {
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
    COMPOSANT SECTION (Arbre + Liste)
========================= */
function SectionTemple({ racine, titre, couleur }: { racine: NoeudTemple, titre: string, couleur: string }) {
  const positions: Position[] = [];
  calculLayout(racine, 20, 30, positions);
  
  const hauteurContenu = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 40;
  const hauteurAffichee = Math.min(hauteurContenu, HAUTEUR_MAX_SECTION);

  return (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 bg-white rounded-xl shadow-md border-b-4 ${couleur === 'red' ? 'border-red-600' : 'border-slate-800'}`}>
          <Shield className={couleur === 'red' ? 'text-red-600' : 'text-slate-800'} size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* 1. LISTE DESCRIPTIVE (GAUCHE) */}
        <section 
          style={{ height: `${hauteurAffichee}px` }}
          className="order-2 xl:order-1 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
            <ScrollText size={18} className="text-slate-400" />
            <h3 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Registres de la Milice</h3>
          </div>
          <div className="overflow-y-auto flex-grow p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
            {positions.map((p) => (
              <div key={p.noeud.id} className="group flex gap-4 border-l-2 border-slate-100 pl-4 hover:border-red-500 transition-colors">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{p.noeud.section}</span>
                    <ChevronRight size={12} className="text-slate-300" />
                  </div>
                  <h4 className="font-black text-slate-900 text-lg">{p.noeud.titre}</h4>
                  <p className="text-sm text-slate-500 italic font-serif leading-relaxed mt-1">{p.noeud.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. ARBRE VISUEL (DROITE) */}
        <section 
          style={{ height: `${hauteurAffichee}px` }}
          className="order-1 xl:order-2 bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 overflow-auto shadow-inner relative"
        >
          <div className="flex justify-center">
            <svg width={LARGEUR_NOEUD + 40} height={hauteurContenu} className="overflow-visible">
              {positions.map((p, i) => (
                <g key={p.noeud.id}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke={couleur === 'red' ? "#ef4444" : "#1e293b"} 
                      strokeWidth="2" strokeDasharray="5 5"
                    />
                  )}
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                    <div className={`h-full w-full bg-white border-2 ${couleur === 'red' ? 'border-red-600' : 'border-slate-800'} rounded-xl p-4 shadow-md flex flex-col justify-center text-center relative hover:scale-105 transition-transform`}>
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${couleur === 'red' ? 'bg-red-600' : 'bg-slate-800'} text-white text-[8px] font-black px-3 py-1 rounded-full uppercase`}>
                        Niveau {i + 1}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{p.noeud.section}</p>
                      <h4 className="text-[14px] font-black text-slate-900 leading-tight uppercase tracking-tighter">{p.noeud.titre}</h4>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HierarchieTemplePage() {
  const [arbreOccident, setArbreOccident] = useState<NoeudTemple[]>([]);
  const [arbreOrient, setArbreOrient] = useState<NoeudTemple[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation des données (Normalement fetchées via API)
  const ordreOccident = [
    { id: 1, section: "Commandement", titre: "Maître de l'Ordre", description: "Chef suprême de la milice." },
    { id: 2, section: "Visite", titre: "Maître en deçà-mer", description: "Visiteur général des provinces d'Occident." },
    { id: 3, section: "Province", titre: "Maître de province", description: "Dirige un pays ou une grande région." },
    { id: 4, section: "Baillie", titre: "Maître de baillie", description: "Responsable d'un district administratif." },
    { id: 5, section: "Logistique", titre: "Maître du passage", description: "Gère les embarquements vers la Terre Sainte." },
    { id: 6, section: "Maison", titre: "Commandeur de maison", description: "Précepteur d'une commanderie locale." }
  ];

  const ordreOrient = [
    { id: 101, section: "Haute Direction", titre: "Grand Commandeur", description: "Second du Maître, gère le trésor." },
    { id: 102, section: "Commandement", titre: "Maître", description: "Le Grand Maître résidant en Terre Sainte." },
    { id: 103, section: "Palais", titre: "Sénéchal", description: "Remplace le Maître et gère l'intendance." },
    { id: 104, section: "Militaire", titre: "Maréchal", description: "Chef militaire suprême sur le terrain." },
    { id: 105, section: "Royaume", titre: "Commandeur de Jérusalem", description: "Gère les domaines du Royaume." }
  ];

  useEffect(() => {
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
    <main className="p-4 md:p-8 min-h-screen bg-[#fafafa]">
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-4xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
          <Cross size={200} />
        </div>
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white shadow-xl rounded-full border-t-4 border-red-600 rotate-12 group-hover:rotate-0 transition-transform">
            <Shield size={50} className="text-slate-900" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
          Hiérarchie de l'Ordre du Temple
        </h1>
        <p className="text-slate-500 font-serif italic text-lg">Organisation de la Milice du Christ en Occident et Orient</p>
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className="h-[2px] w-12 bg-red-600"></span>
          <Cross size={20} className="text-red-600" />
          <span className="h-[2px] w-12 bg-red-600"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-400 font-serif">Ouverture des chroniques de l'Ordre...</div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {arbreOccident.length > 0 && (
            <SectionTemple racine={arbreOccident[0]} titre="Provinces d'Occident" couleur="red" />
          )}
          
          <div className="my-20 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          {arbreOrient.length > 0 && (
            <SectionTemple racine={arbreOrient[0]} titre="Terre Sainte (Orient)" couleur="slate" />
          )}
        </div>
      )}
    </main>
  );
}