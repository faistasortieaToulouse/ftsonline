"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, ScrollText, Shield } from "lucide-react";

/* =========================
    TYPES
========================= */
type Personne = {
  id: number;
  section: string;
  titre: string;
  description: string;
  enfants?: Personne[];
};

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

/* =========================
    CONFIGURATIONS VISUELLES
========================= */
const LARGEUR_NOEUD = 280;
const HAUTEUR_NOEUD = 100;
const ESPACE_V = 60;
const HAUTEUR_MAX_SECTION = 750; // Plafond pour les sections denses

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
    COMPOSANT SECTION (Hauteur Dynamique)
========================= */
function SectionNoblesse({ racine, sectionNom }: { racine: Personne, sectionNom: string }) {
  const positions: Position[] = [];
  calculLayout(racine, 20, 30, positions);
  
  // Calcul de la hauteur réelle du contenu
  const hauteurContenu = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 40;
  // On utilise la hauteur réelle si elle est < 750px, sinon on scroll
  const hauteurAffichee = Math.min(hauteurContenu, HAUTEUR_MAX_SECTION);

  return (
    <div className="mb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white rounded-xl shadow-md border border-amber-100">
          <Shield className="text-amber-600" size={24} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">
          {sectionNom}
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
        
        {/* 1. REGISTRE DES TITRES (Adaptatif) */}
        <section 
          style={{ height: `${hauteurAffichee}px` }}
          className="order-2 xl:order-1 bg-white border-l-4 border-l-blue-900 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col transition-all duration-300"
        >
          <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
            <ScrollText size={18} className="text-blue-900" />
            <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres de la Couronne</h3>
          </div>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Titre Héraldique</th>
                  <th className="px-6 py-4 text-left">Dignité & Prérogatives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((p) => (
                  <tr key={p.noeud.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-8">
                      <div className="font-black text-blue-950 text-xs md:text-sm uppercase tracking-tight">
                        {p.noeud.titre}
                      </div>
                      <div className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-widest">
                        {p.noeud.section.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </td>
                    <td className="px-6 py-8 text-slate-600 text-[11px] md:text-xs leading-relaxed font-serif italic">
                      {p.noeud.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. VISUALISATION GÉNÉALOGIQUE (Adaptatif) */}
        <section 
          style={{ height: `${hauteurAffichee}px` }}
          className="order-1 xl:order-2 bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 md:p-8 overflow-auto shadow-inner relative transition-all duration-300"
        >
          <div className="flex justify-center">
            <svg width={LARGEUR_NOEUD + 40} height={hauteurContenu} className="overflow-visible">
              {positions.map((p, i) => (
                <g key={p.noeud.id}>
                  {i < positions.length - 1 && (
                    <line 
                      x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                      x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                      stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="4 4"
                    />
                  )}
                  
                  <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                    <div className="h-full w-full bg-white border-2 border-blue-900 rounded-xl p-4 shadow-md flex flex-col justify-center text-center transition-all hover:scale-[1.02] relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-widest">
                        Rang {i + 1}
                      </div>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.1em] mb-1 truncate">
                        {p.noeud.section}
                      </p>
                      <h4 className="text-[13px] font-black text-slate-900 leading-tight">
                        {p.noeud.titre}
                      </h4>
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

/* =========================
    PAGE PRINCIPALE
========================= */
export default function HierarchieNoblessePage() {
  const [sectionsArbres, setSectionsArbres] = useState<Record<string, Personne[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const arbreSections = [
    'Titres Souverains',
    'Dignité Héréditaire',
    'Grands Officiers de la Couronne',
    'Grands Officiers de la Maison',
    'Titres de Noblesse',
    'Haute Fonction d\'Etat',
    'Petite Noblesse'
  ];

  useEffect(() => {
    fetch('/api/hierarchieNoblesse')
      .then(res => {
        if (!res.ok) throw new Error("Accès refusé");
        return res.json();
      })
      .then((data: Personne[]) => {
        const result: Record<string, Personne[]> = {};
        arbreSections.forEach(secNom => {
          const filtered = data.filter(p => p.section.startsWith(secNom));
          if (filtered.length > 0) {
            const nodes = filtered.map(d => ({ ...d, enfants: [] }));
            for (let i = 0; i < nodes.length - 1; i++) {
              nodes[i].enfants = [nodes[i + 1]];
            }
            result[secNom] = [nodes[0]];
          }
        });
        setSectionsArbres(result);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les registres.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f8f9fb]">
      <nav className="mb-6 md:mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-bold group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour au portail
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <div className="flex justify-center mb-6">
          <Crown size={60} className="text-amber-500 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
          Hiérarchie de la Noblesse
        </h1>
        <p className="text-slate-500 font-serif italic text-base md:text-lg">
          Rangs, titres et dignités de la Couronne
        </p>
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className="h-[2px] w-20 bg-blue-900"></span>
          <div className="w-3 h-3 border-2 border-amber-500 rotate-45"></div>
          <span className="h-[2px] w-20 bg-blue-900"></span>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-serif italic text-xs uppercase">
          Lecture des parchemins...
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-8 bg-white border border-red-100 rounded-xl text-red-800 italic">
          {error}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {arbreSections.map(section => (
            sectionsArbres[section] && (
              <SectionNoblesse 
                key={section} 
                racine={sectionsArbres[section][0]} 
                sectionNom={section} 
              />
            )
          ))}
        </div>
      )}
    </main>
  );
}