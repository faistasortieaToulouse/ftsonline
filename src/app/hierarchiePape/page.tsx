"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Church, ChevronRight, MapPin, Users } from "lucide-react";

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

  // --- PARAMÈTRES RÉDUITS POUR PLUS D'ESPACE ---
  const LARGEUR_NOEUD = 220; // Réduit de 250 à 220
  const HAUTEUR_NOEUD = 80;
  const ESPACE_V = 30;       // Réduit de 40 à 30
  const ESPACE_H = 60;       // Réduit de 100 à 60 (Barre de défilement plus longue)

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

  const largeurMax = Math.max(...positions.map(p => p.x)) + LARGEUR_NOEUD + 100;
  const hauteurMax = Math.max(...positions.map(p => p.y)) + HAUTEUR_NOEUD + 100;

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
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Organigramme du Saint-Siège</h1>
        <p className="text-slate-500 italic font-serif">Structure des Dicastères et de la Curie Romaine</p>
      </header>

      {loading ? (
        <div className="text-center p-20 animate-pulse text-amber-600 font-bold">Chargement du Registre Pontifical...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-[800px]">
          
          {/* LISTE DE GAUCHE */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-50 border-b font-bold text-xs uppercase tracking-widest text-slate-400 flex justify-between">
              <span>Dignitaires & Fonctions</span>
              <span>{flatData.length} entrées</span>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {flatData.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-slate-800 leading-tight text-sm">{item.personne}</h3>
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">{item.ordre}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <MapPin size={10} className="text-amber-400" /> {item.lieu}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ARBRE DE DROITE : OPTIMISÉ POUR DÉFILEMENT TACTILE */}
          <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl overflow-auto relative h-full touch-pan-x touch-pan-y">
            
            {/* Indicateur mobile discret */}
            <div className="lg:hidden absolute top-4 right-4 z-10 animate-pulse pointer-events-none">
              <div className="bg-amber-600/80 text-white text-[9px] px-2 py-1 rounded-md font-bold uppercase flex items-center gap-1">
                Glissez <ChevronRight size={10} />
              </div>
            </div>

            <div className="p-8" style={{ width: largeurMax, height: hauteurMax }}>
              <svg width={largeurMax} height={hauteurMax} className="overflow-visible">
                {/* LIGNES */}
                {positions.map(p => 
                  p.noeud.enfants?.map((c, idx) => {
                    const childPos = positions.find(cp => cp.noeud.personne === c.personne);
                    if (!childPos) return null;
                    return (
                      <path
                        key={idx}
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

                {/* NOEUDS */}
                {positions.map((p, idx) => (
                  <foreignObject key={idx} x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD}>
                    <div className="h-full w-full bg-white border border-slate-200 rounded-xl shadow-sm p-3 flex flex-col justify-center group hover:border-amber-400 transition-colors">
                      <p className="text-[8px] font-black text-amber-600 uppercase mb-0.5 truncate">{p.noeud.institution}</p>
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