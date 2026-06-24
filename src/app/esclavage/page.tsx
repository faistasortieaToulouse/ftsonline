'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, BookOpen, Globe, ShieldAlert, History, Anchor, MapPin } from "lucide-react";

// Interfaces pour le typage TypeScript
interface Civilisation {
  civilisation: string;
  caracteristiques: string[];
}

interface RoyaumeAfricain {
  nom: string;
  actuel: string;
  role: string[];
}

export default function EsclavagePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/esclavage")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API esclavage");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
          Chargement des données historiques...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">

      {/* NAV */}
      <nav className="mb-8 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-700 font-black uppercase text-[10px] tracking-widest transition-transform hover:-translate-x-1"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>

        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
          <Globe size={14} />
          Histoire mondiale
        </div>
      </nav>

      {/* HEADER */}
      <header className="mb-10 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic break-words">
          {data.theme}
        </h1>

        <p className="text-slate-500 font-bold text-sm mt-4 leading-relaxed">
          {data.message_general.resume}
        </p>
      </header>

      {/* POINTS CLÉS */}
      <section className="mb-10 bg-white p-6 rounded-3xl border shadow-sm">
        <h2 className="font-black uppercase mb-4 flex items-center gap-2 text-slate-800">
          <BookOpen size={18} className="text-blue-600" />
          Points clés
        </h2>

        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
          {data.message_general.points_cles.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      {/* CIVILISATIONS */}
      <section className="mb-10">
        <h2 className="font-black uppercase mb-4 text-slate-800 tracking-wider text-sm">
          Civilisations concernées
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {data.civilisations_pratiquant_esclavage.map((c: Civilisation, i: number) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border shadow-sm hover:border-blue-200 transition-colors"
            >
              <h3 className="font-black text-blue-700 mb-2">
                {c.civilisation}
              </h3>

              <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
                {c.caracteristiques.map((car: string, j: number) => (
                  <li key={j}>{car}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FORMES */}
      <section className="mb-10 bg-white p-6 rounded-3xl border shadow-sm">
        <h2 className="font-black uppercase mb-4 text-slate-800 tracking-wider text-sm">
          Formes d'esclavage
        </h2>

        <div className="flex flex-wrap gap-2">
          {data.formes_esclavage.map((f: string, i: number) => (
            <span
              key={i}
              className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 shadow-2xl"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* TRAITES ET RÉSEAUX */}
      <section className="mb-10 grid md:grid-cols-3 gap-4">
        {/* TRAITE ATLANTIQUE */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="font-black uppercase mb-2 text-blue-700 flex items-center gap-2">
            <Anchor size={18} />
            Traite Atlantique
          </h2>
          <p className="text-xs font-black uppercase text-slate-400 mb-4">Période : {data.traite_atlantique.periode}</p>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Fournisseurs :</span>
              <p className="text-slate-700">{data.traite_atlantique.principaux_acteurs.fournisseurs.join(", ")}</p>
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Transport :</span>
              <p className="text-slate-700">{data.traite_atlantique.principaux_acteurs.organisateurs_transport.join(", ")}</p>
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Acheteurs finaux :</span>
              <p className="text-slate-700">{data.traite_atlantique.principaux_acteurs.acheteurs_finaux.join(", ")}</p>
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Demande commerciale :</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.traite_atlantique.demande.map((d: string, i: number) => (
                  <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TRAITE ORIENTALE */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="font-black uppercase mb-4 text-slate-800 flex items-center gap-2">
            <Globe size={18} className="text-slate-500" />
            Traite Orientale
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Acteurs principaux :</span>
              <p className="text-slate-700">{data.traite_orientale.acteurs.join(", ")}</p>
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Zones géographiques :</span>
              <p className="text-slate-700">{data.traite_orientale.zones.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* EMPIRE OTTOMAN */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h2 className="font-black uppercase mb-4 text-slate-800 flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            Empire Ottoman
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Pratiques :</span>
              <ul className="list-disc pl-4 mt-1 text-slate-700 space-y-1">
                {data.empire_ottoman.pratiques.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-black text-xs uppercase block text-slate-500">Origines des captifs :</span>
              <p className="text-slate-700">{data.empire_ottoman.origines_captifs.join(", ")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROYAUMES AFRICAINS IMPLIQUÉS */}
      <section className="mb-10">
        <h2 className="font-black uppercase mb-4 text-slate-800 tracking-wider text-sm flex items-center gap-2">
          <MapPin size={16} className="text-blue-600" />
          Royaumes africains impliqués dans la traite atlantique
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.royaumes_africains_impliques_dans_traite_atlantique.map((r: RoyaumeAfricain, i: number) => (
            <div key={i} className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-base">{r.nom}</h3>
                <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                  Actuel : {r.actuel}
                </span>
                <ul className="text-xs text-slate-600 list-disc pl-4 mt-3 space-y-1.5">
                  {r.role.map((role: string, j: number) => (
                    <li key={j}>{role}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NUANCES HISTORIQUES */}
      <section className="mb-10 bg-amber-50/50 border border-amber-200 p-6 rounded-3xl shadow-sm">
        <h2 className="font-black uppercase mb-4 text-amber-900 flex items-center gap-2 text-sm tracking-wider">
          <ShieldAlert size={18} className="text-amber-600" />
          Nuances historiques importantes
        </h2>

        <ul className="space-y-3 text-sm text-amber-950">
          {data.nuances_historiques.map((n: string, i: number) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-amber-500 select-none mt-0.5">•</span>
              <p className="font-medium">{n}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* SYNTHÈSE */}
      <section className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl">
        <h2 className="font-black uppercase mb-4 tracking-wider text-sm">
          Synthèse générale
        </h2>

        <p className="text-sm leading-relaxed font-medium opacity-95">
          {data.formulation_synthetique.texte}
        </p>
      </section>

    </div>
  );
}
