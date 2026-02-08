"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Church, ChevronRight, MapPin } from "lucide-react";

type Noeud = {
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string | null;
  niveau_equivalent: string | null;
  enfants?: Noeud[];
};

type Position = { x: number; y: number; noeud: Noeud };

export default function HierarchiePapePage() {
  const [arbre, setArbre] = useState<Noeud[]>([]);
  const [flatData, setFlatData] = useState<Noeud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hierarchiePape")
      .then((res) => res.json())
      .then((data) => {
        setArbre(data);
        const flat: Noeud[] = [];
        const flatten = (nodes: Noeud[]) => {
          nodes.forEach(n => {
            flat.push(n);
            if (n.enfants) flatten(n.enfants);
          });
        };
        flatten(data);
        setFlatData(flat);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- PARAMÈTRES DE MISE EN PAGE ---
  const LARGEUR_NOEUD = 220;
  const HAUTEUR_NOEUD = 80;
  const ESPACE_V = 30;
  const ESPACE_H = 60;

  const positions: Position[] = [];
  
  function layoutHorizontal(node: Noeud, x: number, y: number): number {
    positions.push({ x, y, noeud: node });

    if (node.enfants && node.enfants.length > 0) {
      let childY = y;
      node.enfants.forEach((enfant) => {
        childY = layoutHorizontal(enfant, x + LARGEUR_NOEUD + ESPACE_H, childY);
      });
      return childY;
    }
    return y + HAUTEUR_NOEUD + ESPACE_V;
  }

  if (arbre.length > 0) {
    layoutHorizontal(arbre[0], 20, 20);
  }

  const largeurMax = Math.max(...positions.map(p => p.x), 0) + LARGEUR_NOEUD + 100;
  const hauteurMax = Math.max(...positions.map(p => p.y), 0) + HAUTEUR_NOEUD + 100;

  return (
    <main className="min-h-screen bg-[#FDFCFB] p-4 md:p-8">
      <nav className="max-w-7xl mx-auto mb-8">
        <Link href="/" className="flex items-center gap-2 text-amber-700 font-bold hover:text-amber-800 transition-colors">
          <ArrowLeft size={20} /> Retour au Palais
        </Link>
      </nav>

      <header className="text-center mb-12">
        <div className="inline-block p-3 bg-white shadow-sm rounded-full mb-4 border border-amber-100">
          <Church className="text-amber-600" size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Organigramme du Saint-Siège</h1>
        <p className="text-slate-500 italic font-serif">Structure des Dicastères et de la Curie Romaine</p>
      </header>

      {loading ? (
        <div className="text-center p-20 animate-pulse text-amber-600 font-bold uppercase tracking-widest text-xs">
          Chargement du Registre Pontifical...
        </div>
      ) : (
        /* Conteneur principal : 
           - flex-col sur mobile pour l'empilement.
           - lg:grid sur ordinateur pour les colonnes.
        */
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-8 lg:h-[800px]">
          
          {/* 1. LISTE DE GAUCHE (Tableau/Registre) 
              - order-1 : Premier sur mobile (en haut)
              - lg:order-1 : Premier sur PC (à gauche)
          */}
          <div className="order-1 lg:order-1 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-full">
            <div className="p-4 bg-slate-50 border-b font-bold text-[10px] uppercase tracking-widest text-slate-400 flex justify-between">
              <span>Dignitaires & Fonctions</span>
              <span>{flatData.length} entrées</span>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {flatData.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-amber-200 transition-colors">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-black text-slate-800 leading-tight text-sm">{item.personne}</h3>
                    <span className="text-[8px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">{item.ordre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <MapPin size={10} className="text-amber-400" /> {item.lieu}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. ARBRE DE DROITE (SVG)
              - order-2 : Deuxième sur mobile (en bas)
              - lg:order-2 : Deuxième sur PC (à droite)
          */}
          <div className="order-2 lg:order-2 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl overflow-auto relative h-[600px] lg:h-full touch-pan-x touch-pan-y shadow-inner">
            
            {/* Indicateur mobile discret */}
            <div className="lg:hidden absolute top-4 right-4 z-10 animate-pulse pointer-events-none">
              <div className="bg-amber-600/80 text-white text-[9px] px-2 py-1 rounded-md font-bold uppercase flex items-center gap-1">
                Explorer l'arbre <ChevronRight size={10} />
              </div>
            </div>

            <div className="p-8" style={{ width: largeurMax, height: hauteurMax }}>
              <svg width={largeurMax} height={hauteurMax} className="overflow-visible">
                {/* LIGNES DE CONNEXION */}
                {positions.map(p => 
                  p.noeud.enfants?.map((c, idx) => {
                    const childPos = positions.find(cp => cp.noeud.personne === c.personne);
                    if (!childPos) return null;
                    return (
                      <path
                        key={`${p.noeud.personne}-${idx}`}
                        d={`M ${p.x + LARGEUR_NOEUD} ${p.y + HAUTEUR_NOEUD/2} 
                           C ${p.x + LARGEUR_NOEUD + ESPACE_H/2} ${p.y + HAUTEUR_NOEUD/2},
                             ${childPos.x - ESPACE_H/2} ${childPos.y + HAUTEUR_NOEUD/2},
                             ${childPos.x} ${childPos.y + HAUTEUR_NOEUD/2}`}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                      />
                    );
                  })
                )}

                {/* NOEUDS (CARTES) */}
                {positions.map((p, idx) => (
                  <foreignObject key={idx} x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                    <div className="h-full w-full bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex flex-col justify-center group hover:border-amber-400 transition-all hover:shadow-md cursor-default">
                      <p className="text-[8px] font-black text-amber-600 uppercase mb-0.5 truncate tracking-tighter">
                        {p.noeud.institution}
                      </p>
                      <h4 className="text-[12px] font-bold text-slate-900 leading-tight">{p.noeud.personne}</h4>
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                        <MapPin size={8} /> {p.noeud.lieu}
                      </div>
                    </div>
                  </foreignObject>
                ))}
              </svg>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}