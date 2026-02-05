"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Landmark, Building2, Map as MapIcon } from "lucide-react";
import { DonneesChine, TerritoireChine } from '../api/chine/route';

export default function ChinePage() {
  const [data, setData] = useState<DonneesChine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fonction pour convertir "127,8 millions" en nombre pur pour le tri
  const parsePop = (popStr?: string) => {
    if (!popStr) return 0;
    return parseFloat(popStr.replace(/[^\d,]/g, '').replace(',', '.'));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/chine');
        const json: DonneesChine = await res.json();

        // Tri des provinces et régions par population estimée 2026
        json.administration_territoriale.provinces.sort((a, b) => parsePop(b.population_est_2026) - parsePop(a.population_est_2026));
        json.administration_territoriale.regions_autonomes.sort((a, b) => parsePop(b.population_est_2026) - parsePop(a.population_est_2026));
        
        setData(json);
      } catch (err) {
        console.error("Erreur de fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-20 font-medium text-slate-500 italic">Analyse des données démographiques chinoises...</div>;
  if (!data) return <div className="text-center mt-20">Données non disponibles.</div>;

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline mb-6 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à l'accueil
      </Link>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center uppercase tracking-tighter">
        République Populaire de Chine : Démographie 2026
      </h1>

      {/* Municipalités (Statut Spécial) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-yellow-500 pb-2">
          <Landmark className="text-yellow-600" /> Municipalités de Rang Provincial
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.administration_territoriale.municipalites.map((m, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border-l-4 border-yellow-500 shadow-sm">
              <span className="block font-bold text-slate-800 text-lg">{m.nom}</span>
              <span className="text-yellow-600 font-bold">{m.population_totale_2026}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Provinces et Régions Autonomes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-red-600 pb-2">
          <MapIcon className="text-red-600" /> Provinces & Régions (Triées par pop. 2026)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...data.administration_territoriale.provinces, ...data.administration_territoriale.regions_autonomes]
            .sort((a, b) => parsePop(b.population_est_2026) - parsePop(a.population_est_2026))
            .map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-red-300 transition-all group">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{p.nom}</span>
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">#{i+1}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 italic">Capitale : {p.capitale}</div>
                <div className="mt-3 font-semibold text-red-600 text-sm">{p.population_est_2026}</div>
              </div>
          ))}
        </div>
      </section>

      {/* Villes Principales (Recensement) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b-2 border-blue-600 pb-2">
          <Building2 className="text-blue-600" /> Top 15 Centres Urbains (Recensement 2020)
        </h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-widest">
                <th className="p-4 border-b">Ville</th>
                <th className="p-4 border-b">Province/Division</th>
                <th className="p-4 border-b text-right">Population (2020)</th>
              </tr>
            </thead>
            <tbody>
              {data.villes_principales_urbaines.slice(0, 15).map((v, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors text-sm border-b border-slate-50 last:border-0">
                  <td className="p-4 font-bold text-slate-800">{v.ville}</td>
                  <td className="p-4 text-slate-500">{v.province}</td>
                  <td className="p-4 text-right font-mono text-blue-600">
                    {v.census_2020.toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-16 text-center text-slate-400 text-sm pb-10">
        Source des données : {data.data_source}
      </footer>
    </main>
  );
}
