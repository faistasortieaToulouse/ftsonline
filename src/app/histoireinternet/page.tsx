"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, History, ChevronRight, Zap, Computer, MousePointer2, Cpu } from "lucide-react";

/* =========================
    TYPES
========================= */
interface SiteHistorique {
  id: number;
  nom: string;
  annee: number | string;
  description: string;
}

interface HistoireData {
  titre: string;
  introduction: string;
  conclusion: string;
  sites_importants_popular_mechanics: SiteHistorique[];
}

type Position = {
  x: number;
  y: number;
  site: SiteHistorique;
};

/* =========================
    CONFIGURATIONS VISUELLES
========================= */
const LARGEUR_NOEUD = 280;
const HAUTEUR_NOEUD = 100;
const ESPACE_V = 60; 
const HAUTEUR_MAX_SECTION = 750;

/* =========================
    LOGIQUE LAYOUT
========================= */
function calculLayout(sites: SiteHistorique[], x: number, y: number): Position[] {
  return sites.map((site, index) => ({
    x,
    y: y + index * (HAUTEUR_NOEUD + ESPACE_V),
    site
  }));
}

/* =========================
    COMPOSANT PRINCIPAL
========================= */
export default function HistoireInternetPage() {
  const [data, setData] = useState<HistoireData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/histoireinternet")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sites = data?.sites_importants_popular_mechanics || [];
  const positions = sites.length > 0 ? calculLayout(sites, 20, 30) : [];

  const hauteurContenu = positions.length * (HAUTEUR_NOEUD + ESPACE_V) + 60;
  const hauteurAffichee = Math.min(hauteurContenu, HAUTEUR_MAX_SECTION);

  return (
    <main className="p-4 md:p-8 min-h-screen bg-[#f1f5f9]">
      {/* NAVIGATION */}
      <nav className="mb-8 max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-700 font-bold group transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'Accueil
        </Link>
      </nav>

      {/* HEADER TECH */}
      <header className="mb-16 text-center max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
          <Cpu size={50} className="text-blue-600 opacity-80 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          {data?.titre || "Histoire de l'Internet"}
        </h1>
        <p className="text-blue-700 font-mono italic text-lg uppercase tracking-[0.2em] text-sm">
          Des premiers paquets au World Wide Web
        </p>
        <div className="mt-6 flex justify-center items-center gap-3">
          <div className="h-px w-16 bg-blue-200"></div>
          <Zap size={14} className="text-blue-600 fill-blue-600" />
          <div className="h-px w-16 bg-blue-200"></div>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-900 font-mono italic uppercase text-xs tracking-widest">
          Initialisation des protocoles TCP/IP...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start">
          
          {/* 1. REGISTRE DÉTAILLÉ (GAUCHE) */}
          <section 
            style={{ height: `${hauteurAffichee}px` }}
            className="order-1 xl:order-1 bg-white border border-blue-100 rounded-3xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="bg-blue-50/50 border-b border-blue-100 p-5 flex items-center gap-3">
              <History size={20} className="text-blue-800" />
              <h3 className="text-blue-900 font-black uppercase text-xs tracking-widest">Chronologie des Pionniers</h3>
            </div>
            <div className="overflow-y-auto flex-grow p-6 space-y-8 scrollbar-thin scrollbar-thumb-blue-200">
              {positions.map((p) => (
                <div key={p.site.id} className="relative pl-6 group">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-100 group-hover:bg-blue-500 transition-colors"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{p.site.annee}</span>
                    <ChevronRight size={12} className="text-blue-200" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{p.site.nom}</h4>
                  <p className="text-slate-500 text-sm italic leading-relaxed pr-4">{p.site.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. ARBRE SVG (DROITE) */}
          <section 
            style={{ height: `${hauteurAffichee}px` }}
            className="order-2 xl:order-2 bg-blue-900/5 border-2 border-blue-100 rounded-3xl p-6 overflow-auto shadow-inner relative"
          >
            <div className="flex justify-center">
              <svg width={LARGEUR_NOEUD + 40} height={hauteurContenu} className="overflow-visible">
                {positions.map((p, i) => (
                  <g key={p.site.id}>
                    {/* Lien vertical entre les nœuds */}
                    {i < positions.length - 1 && (
                      <line 
                        x1={p.x + LARGEUR_NOEUD/2} y1={p.y + HAUTEUR_NOEUD} 
                        x2={p.x + LARGEUR_NOEUD/2} y2={positions[i+1].y} 
                        stroke="#2563eb" strokeWidth="2" strokeDasharray="6 4"
                      />
                    )}
                    
                    {/* Carte Technologique */}
                    <foreignObject x={p.x} y={p.y} width={LARGEUR_NOEUD} height={HAUTEUR_NOEUD} className="overflow-visible">
                      <div className="h-full w-full bg-white border-2 border-blue-800 rounded-2xl p-4 shadow-lg flex flex-col justify-center text-center relative hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-sm uppercase whitespace-nowrap tracking-wider">
                          Étape Clé
                        </div>
                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">{p.site.annee}</p>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight tracking-tight uppercase">{p.site.nom}</h4>
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>
          </section>

        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-12 text-center max-w-2xl mx-auto">
        <div className="flex justify-center gap-3 mb-4">
            <Computer size={18} className="text-slate-400" />
            <div className="h-4 w-px bg-slate-200"></div>
            <MousePointer2 size={18} className="text-slate-400" />
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
          {data?.conclusion || "Patrimoine de l'Information Numérique"}
        </p>
      </footer>
    </main>
  );
}
