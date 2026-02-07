'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, ScrollText, Compass } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface HierarchieArabe {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: HierarchieArabe;
};

const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

function calculLayout(liste: HierarchieArabe[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieArabePage() {
  const [personnes, setPersonnes] = useState<HierarchieArabe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Pour capturer les erreurs du route.ts
  
  const positions: Position[] = [];
  
  useEffect(() => {
    fetch('/api/hierarchieArabe')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors du chargement des données");
        return res.json();
      })
      .then((data) => {
        // Vérification si l'API a renvoyé l'objet d'erreur du catch (route.ts)
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setPersonnes(data.map((p, i) => ({ ...p, id: p.id || i + 1 })));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de lire les parchemins (Fichier JSON introuvable ou mal formé)");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 60;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#faf9f6]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-amber-600">
          <Compass size={40} className="md:w-12 md:h-12" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          👑 Hiérarchie Arabe
        </h1>
        <p className="text-slate-500 italic font-serif text-sm">Structure des titres et fonctions de l'Empire</p>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-amber-900 font-serif italic">
          Transcription des parchemins...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <p className="font-bold">Hélas !</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col xl:grid xl:grid-cols-[1fr_350px] gap-8 items-start">
          
          {/* 1. TABLEAU (ORDRE 1 SUR MOBILE) */}
          <div className="w-full order-1 bg-white border-l-4 border-l-amber-600 rounded-r-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-amber-700" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registre des Titres</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed md:table-auto">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold">
                  <tr>
                    <th className="px-3 py-4 text-left w-12 md:w-20">Rang</th>
                    <th className="px-3 py-4 text-left w-32 md:w-48">Titre</th>
                    <th className="px-3 py-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-3 py-4 text-center font-bold text-amber-800 bg-amber-50/50 text-xs">
                        {p.id}
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-bold text-slate-900 leading-tight text-xs md:text-sm break-words">
                          {p.titre}
                        </div>
                        <div className="text-[8px] md:text-[10px] text-amber-600 font-semibold uppercase mt-1">
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

          {/* 2. ARBRE (ORDRE 2 SUR MOBILE) */}
          <div className="w-full order-2 bg-[#fcfaf7] border-2 border-amber-50 rounded-3xl p-4 md:p-8 overflow-auto max-h-[600px] xl:max-h-[750px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#d4a373" strokeWidth="1.5" strokeDasharray="8 4"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[110px] w-full bg-white border-2 border-amber-50 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-amber-500 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-md border border-amber-400 uppercase whitespace-nowrap">
                          Rang {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-amber-700 font-bold uppercase mb-1 tracking-widest">{p.noeud.section}</p>
                        <h4 className="text-[14px] md:text-[16px] font-black text-slate-900 leading-tight">{p.noeud.titre}</h4>
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