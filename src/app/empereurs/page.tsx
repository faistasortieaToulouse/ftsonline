"use client";
import { useEffect, useState } from 'react';
import { ArrowLeft, Landmark, History, Globe } from 'lucide-react';
import Link from 'next/link';

type Empire = {
  pays: string;
  dates: string;
  precision: string;
};

type EmpireData = {
  [region: string]: Empire[];
};

export default function EmpereursPage() {
  const [regions, setRegions] = useState<EmpireData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/empereurs')
      .then(res => res.json())
      .then(data => {
        setRegions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center font-serif text-amber-800">Chargement des chroniques impériales...</div>;

  return (
    <div className="min-h-screen bg-[#fcf9f1] p-4 md:p-8 font-serif">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-600 mb-8 transition-colors">
          <ArrowLeft size={20} />
          Retour au portail
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 flex justify-center items-center gap-4">
            <Landmark size={40} />
            Héritages Impériaux
          </h1>
          <p className="text-amber-700 italic max-w-2xl mx-auto">
            "Une exploration des nations et des époques où le titre suprême d'Empereur a façonné l'histoire du monde."
          </p>
        </header>

        <div className="grid gap-10">
          {regions && Object.entries(regions).map(([regionName, empires]) => (
            <section key={regionName} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-600">
              <h2 className="text-2xl font-bold text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-amber-100 pb-2">
                <Globe size={24} className="text-amber-600" />
                {regionName}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {empires.map((emp, idx) => (
                  <div key={idx} className="group p-4 rounded bg-amber-50/50 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-200">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800 text-lg">{emp.pays}</h3>
                      <div className="flex items-center gap-1 text-amber-600 text-xs font-sans font-bold">
                        <History size={12} />
                        {emp.dates}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm italic">{emp.precision}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 p-6 bg-amber-900 text-amber-100 rounded-xl text-sm leading-relaxed">
          <h4 className="font-bold mb-2 flex items-center gap-2 underline">Note Historique :</h4>
          <p>Le titre d'Empereur (Tsar, Kaiser, Shah, etc.) varie selon les cultures mais désigne souvent le dirigeant suprême d'un ensemble de territoires vastes. Plusieurs de ces empires couvraient des régions bien plus larges que les frontières nationales actuelles.</p>
        </footer>
      </div>
    </div>
  );
}
