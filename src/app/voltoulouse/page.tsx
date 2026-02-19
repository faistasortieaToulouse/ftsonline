"use client";

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, PlaneTakeoff, Search, Globe, Calendar, Plane } from "lucide-react";

export default function VolToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Tous");

  useEffect(() => {
    fetch('/api/voltoulouse')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-sky-600 font-bold uppercase tracking-widest">Chargement du plan de vol...</div>;
  if (!data) return <div className="p-20 text-center text-red-500 font-bold">Données de vol non disponibles.</div>;

  const vols = data.vols || [];
  
  // Extraire la liste unique des pays pour le filtre
  const paysDisponibles = ["Tous", ...new Set(vols.map((v: any) => v.pays))].sort();

  // Filtrage des données
  const filteredVols = vols.filter((v: any) => {
    const matchesSearch = v.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "Tous" || v.pays === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen my-6 shadow-2xl rounded-3xl border border-slate-200">
      
      {/* Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sky-700 font-bold hover:bg-sky-50 p-2 rounded-lg transition-all mb-8">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      {/* Header style Terminal */}
      <header className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <PlaneTakeoff className="text-sky-400" size={32} />
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Départs Directs</h1>
          </div>
          <p className="text-sky-300 font-mono text-lg">{data.aeroport_depart}</p>
        </div>
        <Globe className="absolute -right-10 -bottom-10 text-white/5" size={300} />
      </header>

      {/* Filtres et Barre de recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une destination (ex: Londres, Marrakech...)"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {paysDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Grille des vols */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVols.map((vol: any, i: number) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded">
                  {vol.pays}
                </span>
                <Plane size={16} className="text-slate-200 group-hover:text-sky-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-700">{vol.destination}</h3>
              
              <div className="flex items-center gap-2 text-slate-600 mb-4 text-sm">
                <Calendar size={14} className="text-sky-500" />
                <span className="font-medium">{vol.frequence}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Compagnies</p>
              <div className="flex flex-wrap gap-2">
                {vol.compagnies.map((c: string, j: number) => (
                  <span key={j} className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded-md font-semibold border border-sky-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVols.length === 0 && (
        <div className="py-20 text-center text-slate-400 italic">
          Aucun vol trouvé pour cette recherche.
        </div>
      )}

      <footer className="mt-12 text-center text-slate-400 text-[10px] uppercase tracking-widest border-t pt-8">
        Données indicatives • Aéroport de Toulouse-Blagnac (TLS)
      </footer>
    </main>
  );
}
