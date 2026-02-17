import React from 'react';
import Link from "next/link";
import { 
  ArrowLeft, 
  Droplets, 
  Sun, 
  Wind, 
  ThermometerSun, 
  TreePine, 
  Bird, 
  Zap,
  CloudAlert
} from "lucide-react";

async function getEnvironnement() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  try {
    const res = await fetch(`${baseUrl}/api/environnement`, { cache: 'no-store' });
    return res.json();
  } catch (e) { return null; }
}

export default async function EnvironnementPage() {
  const data = await getEnvironnement();

  if (!data) return <div className="p-10 text-center">Analyse de l'écosystème en cours...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <nav className="max-w-5xl mx-auto mb-6 text-emerald-700 font-bold">
        <Link href="/" className="inline-flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <header className="mb-16">
          <h1 className="text-5xl font-serif text-slate-800 mb-4 tracking-tight">Environnement & Climat</h1>
          <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
            Toulouse se réinvente entre sa <strong>Garonne protectrice</strong> et les défis d'un <strong>climat de plus en plus extrême</strong>.
          </p>
        </header>

        {/* CLIMAT & RECORDS */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-blue-50">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <Sun className="text-amber-500" /> Le Ciel Toulousain
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="block text-2xl font-bold text-slate-800">{data.climat.stats.ensoleillement}</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Soleil</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-800">{data.climat.stats.pluie}</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Pluie</span>
              </div>
              <div className="text-red-600">
                <span className="block text-2xl font-bold">{data.climat.stats.records.chaud}</span>
                <span className="text-xs uppercase opacity-60 font-bold">Record</span>
              </div>
              <div className="text-blue-600">
                <span className="block text-2xl font-bold">{data.climat.stats.records.froid}</span>
                <span className="text-xs uppercase opacity-60 font-bold">Record</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Wind size={20} /> Le Vent d'Autan
            </h3>
            <p className="text-sm opacity-90 leading-relaxed italic">
              "Le vent qui rend fou." Il souffle du Sud-Est, assèche les sols et peut atteindre 100 km/h en ville.
            </p>
          </div>
        </section>

        {/* LES DÉFIS ENVIRONNEMENTAUX */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {data.defis.map((defi: any, idx: number) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors">
              <div className="text-xs font-bold text-emerald-600 uppercase mb-2">{defi.categorie}</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{defi.titre}</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">{defi.description}</p>
              <div className="flex flex-wrap gap-2">
                {defi.points.map((p: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BIODIVERSITÉ ET TRANSITION */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-emerald-900 text-white p-8 rounded-3xl md:col-span-1">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bird /> Biodiversité
            </h3>
            <ul className="space-y-4 text-sm">
              {data.faune.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Zap className="text-amber-500" /> Innovation & Mobilité
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-700">Téléo : Le ciel pour horizon</h4>
                <p className="text-sm text-slate-500">Plus long téléphérique urbain de France. Une alternative décarbonée pour franchir la Garonne.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-700">L'Hydrogène Vert</h4>
                <p className="text-sm text-slate-500">Via le projet HyPort à Blagnac pour une aéronautique et des transports propres.</p>
              </div>
            </div>
          </div>
        </section>

        {/* POINT NOIR / ALERTE */}
        <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <CloudAlert className="text-amber-600 shrink-0" size={32} />
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Le défi de la qualité de l'air</h4>
            <p className="text-sm text-amber-800 opacity-80 leading-relaxed">
              Encastrée dans sa cuvette, Toulouse souffre encore d'une forte pollution liée au trafic routier sur son périphérique. C'est le grand combat de la ZFE (Zone à Faibles Émissions) pour les années à venir.
            </p>
          </div>
        </div>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© 2026 - Observatoire Environnemental de la Ville Rose</p>
        </footer>
      </div>
    </div>
  );
}
