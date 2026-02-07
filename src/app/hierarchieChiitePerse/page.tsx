'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, ScrollText, MoonStar } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface ChiitePerse {
  id: number;
  section: string;
  titre: string;
  description: string;
}

type Position = {
  x: number;
  y: number;
  noeud: ChiitePerse;
};

const LARGEUR_NOEUD = 280; // Légèrement élargi pour les titres longs
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

function calculLayout(liste: ChiitePerse[], x: number, y: number, positions: Position[]) {
  liste.forEach((item, index) => {
    positions.push({ x, y: y + (index * DISTANCE_ENTRE_NOEUDS), noeud: item });
  });
}

export default function HierarchieChiitePersePage() {
  const [personnes, setPersonnes] = useState<ChiitePerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positions: Position[] = [];
  
  useEffect(() => {
    // Appel à l'API définie dans votre route.ts
    fetch('/api/hierarchieChiitePerse')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          // On s'assure que les IDs suivent l'ordre du fichier JSON
          setPersonnes(data.map((p, i) => ({ ...p, id: i + 1 })));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger la hiérarchie Perse (Vérifiez l'API et le fichier JSON)");
        setLoading(false);
      });
  }, []);

  if (!loading && !error) {
    calculLayout(personnes, 20, 20, positions);
  }

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 60;

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f7f9f7]">
      
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 hover:text-emerald-600 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-10 md:mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-4 text-emerald-700">
          <MoonStar size={48} className="animate-pulse" />
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
          🕌 Hiérarchie Chiite Perse
        </h1>
        <p className="text-slate-500 italic font-serif text-sm md:text-base">Structure spirituelle et académique d'Iran et d'Irak</p>
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="h-[1px] w-12 md:w-20 bg-emerald-200"></span>
          <div className="w-2 h-2 bg-emerald-700 rounded-full"></div>
          <span className="h-[1px] w-12 md:w-20 bg-emerald-200"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-emerald-900 font-serif italic uppercase tracking-[0.2em] text-[10px]">
          Consultation des manuscrits anciens...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-200 rounded-xl text-red-800 shadow-sm">
          <p className="font-bold uppercase tracking-widest text-xs mb-2">Accès Interrompu</p>
          <p className="text-sm italic">{error}</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* 1. REGISTRE (TABLEAU) */}
          <div className="order-2 xl:order-1 bg-white border-l-4 border-l-emerald-700 rounded-r-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
              <ScrollText size={18} className="text-emerald-800" />
              <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registre des Savants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] md:text-[10px] font-bold sticky top-0">
                  <tr>
                    <th className="px-4 py-4 text-left w-16">Rang</th>
                    <th className="px-4 py-4 text-left w-48">Titre / Section</th>
                    <th className="px-4 py-4 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-4 text-center font-bold text-emerald-800 bg-emerald-50/50 text-xs">{p.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 leading-tight text-xs md:text-sm">{p.titre}</div>
                        <div className="text-[9px] md:text-[10px] text-emerald-600 font-semibold uppercase mt-1">{p.section}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-[11px] md:text-xs leading-relaxed italic break-words">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. ARBRE VISUEL */}
          <div className="order-1 xl:order-2 bg-[#f0f4f0] border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto max-h-[600px] xl:max-h-[750px] shadow-inner relative">
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={i}>
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.4"
                      />
                    )}
                    
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                      <div className="min-h-[110px] w-full bg-white border border-emerald-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center transition-all hover:border-emerald-600 hover:shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-md border border-emerald-500 uppercase">
                          Rang {p.noeud.id}
                        </div>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase mb-1 tracking-widest break-words w-full px-2">
                          {p.noeud.section}
                        </p>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight break-words w-full px-4">
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