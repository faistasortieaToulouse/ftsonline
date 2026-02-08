"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, ScrollText, Cross, Loader2 } from "lucide-react";

/* =========================
    TYPES
========================= */
interface Personne {
  personne: string;
  lieu: string;
  institution: string;
  ordre: string;
  superieur: string;
  niveau_equivalent?: string;
}

type Position = {
  x: number;
  y: number;
  noeud: Personne;
};

/* =========================
    CONFIGURATIONS
========================= */
const LARGEUR_NOEUD = 260;
const HAUTEUR_VISUELLE = 100; 
const DISTANCE_ENTRE_NOEUDS = 160;

const ORDRES_CONFIG = [
  {
    titre: "Classes de l'Ordre",
    // On filtre si l'institution contient ces mots
    filter: (p: Personne) => p.institution.includes("classe") || p.personne.includes("Chevaliers")
  },
  {
    titre: "Structures & Lieux",
    filter: (p: Personne) => p.lieu.includes("Commanderie") || p.lieu.includes("Prieuré")
  }
];

/* =========================
    SECTION MALTE
========================= */
function SectionMalte({ titre, data }: { titre: string, data: Personne[] }) {
  if (data.length === 0) return null;

  // Calcul des positions pour le SVG
  const positions: Position[] = data.map((item, index) => ({
    x: 20,
    y: 20 + (index * DISTANCE_ENTRE_NOEUDS),
    noeud: item
  }));

  const hMax = data.length * DISTANCE_ENTRE_NOEUDS + 40;

  return (
    <div className="mb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1.5 bg-red-600 rounded-full"></div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{titre}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* 1. TABLEAU (REGISTRES) */}
        <div className="bg-white border-l-4 border-l-red-600 rounded-r-2xl shadow-xl border border-slate-200 flex flex-col h-[600px]">
          <div className="bg-slate-50 border-b p-4 flex items-center gap-2 flex-shrink-0">
            <ScrollText size={18} className="text-red-600" />
            <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Registres Hospitaliers</h3>
          </div>
          <div className="overflow-y-auto flex-grow">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-left w-16 bg-slate-50">Rang</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Désignation</th>
                  <th className="px-6 py-4 text-left bg-slate-50">Localisation & Supérieur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((node, idx) => (
                  <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-6 font-mono text-slate-400 text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-slate-900 leading-tight text-xs md:text-sm">{node.personne}</div>
                      <div className="text-[10px] text-red-600 font-bold uppercase mt-1">{node.institution}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                        <MapPin size={12} className="text-red-500 flex-shrink-0"/> {node.lieu}
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 italic font-serif">Sup: {node.superieur}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ARBRE VISUEL (SVG) */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 overflow-auto h-[600px] shadow-inner flex justify-center">
          <svg width={LARGEUR_NOEUD + 40} height={hMax} className="overflow-visible">
            {/* Lignes de liaison */}
            {positions.map((p, i) => (
              <g key={`line-${i}`}>
                {i < positions.length - 1 && (
                  <line 
                    x1={p.x + LARGEUR_NOEUD / 2} y1={p.y + HAUTEUR_VISUELLE / 2}
                    x2={p.x + LARGEUR_NOEUD / 2} y2={positions[i+1].y + HAUTEUR_VISUELLE / 2}
                    stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5"
                  />
                )}
              </g>
            ))}
            {/* Boîtes */}
            {positions.map((p, i) => (
              <foreignObject key={`node-${i}`} x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_VISUELLE} className="overflow-visible">
                <div className="h-full w-full bg-white border-2 border-red-600 rounded-xl p-3 shadow-md flex flex-col justify-center text-center hover:shadow-lg transition-all relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded shadow-sm uppercase tracking-widest">
                    Niveau {i + 1}
                  </div>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 truncate px-2">
                    {p.noeud.institution}
                  </p>
                  <h4 className="text-[12px] font-black text-slate-900 leading-tight px-2">
                    {p.noeud.personne}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-1 italic font-serif px-2 truncate">
                    {p.noeud.lieu}
                  </p>
                </div>
              </foreignObject>
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
export default function HierarchieMaltePage() {
  const [data, setData] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hierarchieMalte')
      .then(res => res.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Incapable d'ouvrir les registres.");
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-white">
      <nav className="mb-10 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-red-700 font-bold">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <header className="mb-16 text-center max-w-7xl mx-auto">
        <ShieldCheck size={64} className="text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase">Souverain Ordre de Malte</h1>
      </header>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-red-600" /></div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {ORDRES_CONFIG.map((config, idx) => (
            <SectionMalte 
              key={idx} 
              titre={config.titre} 
              data={data.filter(config.filter)} 
            />
          ))}
        </div>
      )}
    </main>
  );
}