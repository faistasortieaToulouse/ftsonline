'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, BookOpen, Globe } from "lucide-react";

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
          className="inline-flex items-center gap-2 text-blue-700 font-black uppercase text-[10px] tracking-widest"
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
        <h1 className="text-4xl md:text-6xl font-black uppercase italic">
          {data.theme}
        </h1>

        <p className="text-slate-500 font-bold text-sm mt-4">
          {data.message_general.resume}
        </p>
      </header>

      {/* POINTS CLÉS */}
      <section className="mb-10 bg-white p-6 rounded-3xl border">
        <h2 className="font-black uppercase mb-4 flex items-center gap-2">
          <BookOpen size={18} />
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
        <h2 className="font-black uppercase mb-4">
          Civilisations concernées
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {data.civilisations_pratiquant_esclavage.map((c: any, i: number) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border shadow-sm"
            >
              <h3 className="font-black text-blue-700 mb-2">
                {c.civilisation}
              </h3>

              <ul className="text-sm text-slate-600 list-disc pl-4">
                {c.caracteristiques.map((car: string, j: number) => (
                  <li key={j}>{car}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FORMES */}
      <section className="mb-10 bg-white p-6 rounded-3xl border">
        <h2 className="font-black uppercase mb-4">
          Formes d'esclavage
        </h2>

        <div className="flex flex-wrap gap-2">
          {data.formes_esclavage.map((f: string, i: number) => (
            <span
              key={i}
              className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* SYNTHÈSE */}
      <section className="bg-blue-600 text-white p-8 rounded-[3rem] shadow-xl">
        <h2 className="font-black uppercase mb-4">
          Synthèse
        </h2>

        <p className="text-sm leading-relaxed">
          {data.formulation_synthetique.texte}
        </p>
      </section>

    </div>
  );
}
