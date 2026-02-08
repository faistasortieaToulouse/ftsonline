'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Shield, ScrollText, User, MapPin, Crown, Loader2 } from "lucide-react";

/* =========================
    TYPES & CONFIG
========================= */
interface Hospitalier {
  id: number;
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string;
  niveau_equivalent: string | null;
}

type Position = {
  x: number;
  y: number;
  noeud: Hospitalier;
};

const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 110; 
const DISTANCE_ENTRE_NOEUDS = 180; 

export default function HierarchieHospitalierPage() {
  const [personnes, setPersonnes] = useState<Hospitalier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hierarchieHospitalier')
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de l'accès aux registres");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          const withId = data.map((p: any, index: number) => ({
            ...p,
            id: index + 1,
          }));
          setPersonnes(withId);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger la hiérarchie.");
        setLoading(false);
      });
  }, []);

  // Logique de calcul du layout pour l'arbre SVG
  const positions: Position[] = [];
  personnes.forEach((item, index) => {
    positions.push({ 
      x: 20, 
      y: 20 + (index * DISTANCE_ENTRE_NOEUDS), 
      noeud: item 
    });
  });

  const hMax = positions.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <main className="p-2 md:p-8 min-h-screen bg-[#fcfaf7]">
      <nav className="mb-4 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm md:text-base">Retour à la commanderie</span>
        </Link>
      </nav>

      <header className="mb-8 text-center max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-2 text-blue-900">
          <Shield size={40} className="md:w-12 md:h-12" />
        </div>
        <h1 className="text-xl md:text-4xl font-black text-slate-900 mb-1 tracking-tighter uppercase leading-tight">
          🛡️ Hiérarchie Hospitalière
        </h1>
        <p className="text-slate-500 italic font-serif text-[10px] md:text-sm">Ordre Souverain de Saint-Jean de Jérusalem</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-900" size={32} />
          <p className="text-blue-900 font-serif text-[10px] uppercase tracking-widest">Lecture des parchemins...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 shadow-sm font-serif italic text-sm">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 items-start">
          
          {/* 1. REGISTRE (TABLEAU OU CARTES) */}
          <div className="bg-white border-l-4 border-l-blue-900 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[600px] md:h-[750px]">
            <div className="bg-slate-50 border-b p-3 md:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <ScrollText size={16} className="text-blue-900" />
                <h3 className="text-slate-800 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">Registres de la Langue</h3>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {/* Desktop : Tableau classique */}
              <table className="hidden md:table w-full text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-4 text-left w-16 bg-slate-50">Rang</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Dignitaire</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Institution</th>
                    <th className="px-4 py-4 text-left bg-slate-50">Supérieur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {personnes.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-6 text-center font-bold text-blue-900 bg-blue-50/20">{p.id}</td>
                      <td className="px-4 py-6 font-bold text-slate-900">{p.personne}</td>
                      <td className="px-4 py-6">
                        <div className="font-semibold text-blue-800 leading-tight">{p.institution}</div>
                        <div className="text-[10px] text-slate-400 italic mt-1">{p.lieu}</div>
                      </td>
                      <td className="px-4 py-6 text-slate-500 italic text-[11px] leading-relaxed">{p.superieur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile : Cartes empilées */}
              <div className="md:hidden space-y-3 p-3">
                {personnes.map((p) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative">
                    <div className="absolute top-0 right-0 bg-blue-900 text-white px-3 py-1 text-[10px] font-black rounded-bl-lg">
                      #{p.id}
                    </div>
                    <div className="flex items-center gap-2 mb-2 pr-10">
                      <User size={14} className="text-blue-900 shrink-0" />
                      <h4 className="font-black text-slate-900 text-xs uppercase break-words">{p.personne}</h4>
                    </div>
                    <div className="space-y-2 border-t border-slate-200 pt-2">
                      <div className="flex items-start gap-2">
                        <Crown size={12} className="text-blue-700 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-blue-800 uppercase leading-tight">{p.institution}</p>
                          <p className="text-[9px] text-slate-500 italic mt-0.5">{p.lieu}</p>
                        </div>
                      </div>
                      <div className="bg-white/60 p-2 rounded border border-blue-50">
                        <p className="text-[8px] uppercase font-bold text-slate-400 mb-1">Autorité supérieure</p>
                        <p className="text-[10px] text-slate-600 italic leading-snug">{p.superieur}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. ARBRE VISUEL SVG */}
          <div className="bg-[#f4f2ee] border-2 border-slate-200 rounded-3xl p-4 overflow-auto h-[600px] md:h-[750px] shadow-inner flex justify-center">
            <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
              {positions.map((p, i) => (
                <g key={i}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_VISUELLE} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 5"
                    />
                  )}
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={DISTANCE_ENTRE_NOEUDS - 20} className="overflow-visible">
                    <div className="min-h-[110px] w-full bg-white border border-blue-100 rounded-xl p-4 shadow-md flex flex-col items-center justify-center text-center hover:border-blue-900 transition-all">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[9px] font-black px-4 py-1 rounded shadow-md uppercase">
                        Rang {p.noeud.id}
                      </div>
                      <p className="text-[9px] text-blue-700 font-black uppercase mb-1 tracking-widest">{p.noeud.institution}</p>
                      <h4 className="text-[13px] font-black text-slate-900 leading-tight">{p.noeud.personne}</h4>
                      <p className="text-[9px] text-slate-400 mt-2 font-serif italic truncate w-full">{p.noeud.lieu}</p>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          </div>

        </div>
      )}
    </main>
  );
}