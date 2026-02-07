'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, ScrollText, MoonStar } from "lucide-react";

/* =========================
    TYPES & CONFIG (Adaptés à ton JSON)
========================= */
interface HierarchieChiite {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: HierarchieChiite;
};

const LARGEUR_NOEUD = 280;
const HAUTEUR_VISUELLE = 120; 
const DISTANCE_ENTRE_NOEUDS = 190; 

function calculLayout(liste: HierarchieChiite[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieChiitePage() {
  const [personnes, setPersonnes] = useState<HierarchieChiite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieChiite')
      .then(res => {
        if (!res.ok) throw new Error("Le serveur n'a pas trouvé la route API");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          // On garde l'ordre du JSON
          setPersonnes(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de lire le fichier 'hierarchie Chiite.json'.");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 80;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f0f4f2]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-emerald-700">
          <MoonStar size={40} className="md:w-12 md:h-12" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-2 tracking-tighter uppercase">
          🕌 Hiérarchie Chiite
        </h1>
        <p className="text-emerald-700/70 italic font-serif tracking-wide text-sm">Structure de l'autorité et du savoir</p>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-emerald-800 font-serif italic uppercase tracking-widest text-[10px]">
          Analyse de la jurisprudence...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-200 rounded-xl text-red-800 shadow-sm">
          <p className="font-bold uppercase tracking-widest text-xs mb-2">Erreur de données</p>
          <p className="text-sm italic">{error}</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col xl:grid xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. TABLEAU DES TITRES */}
          <div className="w-full order-1 bg-white border-l-4 border-l-emerald-700 rounded-r-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-50/50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-emerald-700" />
              <h3 className="text-emerald-900 font-bold uppercase text-[10px] tracking-widest">Registre des Savants</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed md:table-auto">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-4 text-left w-12 md:w-16">Niv.</th>
                    <th className="px-3 py-4 text-left w-32 md:w-56">Titre / Rang</th>
                    <th className="px-3 py-4 text-left">Jurisprudence & Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-3 py-4 text-center font-bold text-emerald-800 bg-emerald-50/20 text-xs">
                        {p.id}
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-bold text-slate-900 text-xs md:text-sm leading-tight break-words">
                          {p.titre}
                        </div>
                        <div className="text-[8px] md:text-[10px] text-emerald-600 font-semibold uppercase mt-1">
                          {p.section}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-slate-600 text-[11px] md:text-xs leading-relaxed italic break-words">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG */}
          <div className="w-full order-2 bg-[#f8faf9] border-2 border-emerald-100 rounded-3xl p-4 md:p-8 overflow-auto max-h-[600px] xl:max-h-[800px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {/* Ligne de connexion */}
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3"
                      />
                    )}
                    
                    <foreignObject 
                      x={p.x} 
                      y={p.y} 
                      width={LARGEUR_NOEUD} 
                      height={DISTANCE_ENTRE_NOEUDS - 20} 
                      className="overflow-visible"
                    >
                      <div className="min-h-[120px] w-full bg-white border border-emerald-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500 hover:shadow-lg relative">
                        {/* Badge de niveau */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-md border border-emerald-400 uppercase whitespace-nowrap">
                          Rang {p.noeud.id}
                        </div>
                        
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1 tracking-widest">
                          {p.noeud.section}
                        </p>
                        <h4 className="text-[14px] md:text-[15px] font-black text-slate-800 leading-tight">
                          {p.noeud.titre}
                        </h4>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}