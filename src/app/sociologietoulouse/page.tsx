"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plane, MapPin, TrendingUp, Landmark, Star } from "lucide-react";

export default function SociologieToulousePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sociologietoulouse")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center font-mono text-rose-600">Scan de la métropole toulousaine...</div>;
  if (!data || data.error) return <div className="p-10 text-center text-red-500 font-bold">Erreur : {data?.error}</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-rose-800 hover:underline font-bold">
          <ArrowLeft size={20} /> Retour
        </Link>
      </nav>

      {/* HEADER : IDENTITÉ TOULOUSAINE */}
      <header className="mb-12 border-b-8 border-rose-700 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-5xl font-black text-rose-900 uppercase tracking-tighter">
              {data.metropole} <span className="text-rose-500 font-light">| {data.surnom}</span>
            </h1>
            <p className="text-slate-500 font-mono mt-2 uppercase tracking-widest">Analyse Socio-Démographique {data.annee_analyse}</p>
          </div>
          <div className="bg-rose-100 px-4 py-2 rounded-full text-rose-700 font-bold flex items-center gap-2">
            <Plane size={18} /> Hub Aéronautique Mondial
          </div>
        </div>
      </header>

      {/* CHIFFRES CLÉS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {Object.entries(data.caracteristiques_majeures).map(([key, val]: any, i) => (
          <div key={i} className="bg-slate-900 text-white p-4 rounded-lg">
            <p className="text-[10px] text-rose-400 uppercase font-black mb-1">{key.replace(/_/g, ' ')}</p>
            <p className="text-lg font-bold leading-tight">{val}</p>
          </div>
        ))}
      </div>

      {/* STRUCTURE GÉOGRAPHIQUE */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 uppercase">
          <MapPin className="text-rose-600" /> Morphologie de la Ville
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.structure_geographique?.map((secteur: any, i: number) => (
            <div key={i} className="group border-2 border-slate-100 hover:border-rose-200 p-6 rounded-2xl transition-all bg-white">
              <h3 className="text-lg font-black text-rose-700 mb-2 uppercase group-hover:translate-x-1 transition-transform">
                {secteur.secteur}
              </h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {secteur.zones.map((z: string, idx: number) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded italic">#{z}</span>
                ))}
              </div>
              <p className="text-sm text-slate-800 font-bold mb-2">Profil : {secteur.profil_habitants}</p>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border-l-4 border-rose-500">
                <strong>Dynamique :</strong> {secteur.dynamique}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLASSEMENT RICHESSE (DEUX COLONNES) */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 uppercase">
          <Landmark className="text-rose-600" /> Analyse de la Fortune Urbaine
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Quartiers Riches */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs flex items-center gap-2 border-b pb-2">
              <Star size={14} className="text-amber-500" /> Top 5 Quartiers (Intra-Muros)
            </h3>
            {data.classement_richesse.intra_muros.map((q: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white border-b border-slate-100 hover:bg-rose-50 transition-colors">
                <div>
                  <p className="font-black text-slate-800">{q.quartier}</p>
                  <p className="text-[10px] text-rose-500 uppercase font-bold">{q.type}</p>
                </div>
                <p className="text-xs text-slate-500 max-w-[200px] text-right">{q.details}</p>
              </div>
            ))}
          </div>

          {/* Banlieues Premium */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs flex items-center gap-2 border-b pb-2">
              <Star size={14} className="text-rose-700" /> Banlieues & Coteaux Premium
            </h3>
            {data.classement_richesse.banlieue_premium.map((b: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-black text-rose-900">{b.commune}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold italic">{b.profil}</p>
                </div>
                <p className="text-xs text-slate-500 max-w-[200px] text-right italic">{b.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONES CHARNIÈRES */}
      <div className="bg-rose-900 text-white p-8 rounded-3xl">
        <div className="flex items-center gap-4 mb-6">
          <TrendingUp className="text-rose-400" size={32} />
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Zoom sur La Cépière</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-rose-200 uppercase text-xs font-bold tracking-widest">Statut : {data.zones_charnieres.la_cepiere.statut}</p>
            <p className="text-xl leading-relaxed">{data.zones_charnieres.la_cepiere.enjeu}</p>
          </div>
          <div className="bg-rose-800 p-6 rounded-2xl border border-rose-700">
            <p className="text-sm italic">"Composition sociale : {data.zones_charnieres.la_cepiere.composition}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
