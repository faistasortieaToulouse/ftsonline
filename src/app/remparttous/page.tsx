"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Castle, EyeOff, MapPin } from 'lucide-react';

interface Lieu {
  ville: string;
  description: string;
}

interface Data {
  la_piece_maitresse: Lieu[];
  vestiges_majeurs: Lieu[];
  vestiges_partiels_ou_discrets: Lieu[];
}

export default function RempartTousPage() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch('/api/remparttous')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <div className="p-10 text-center font-serif text-slate-500">Chargement de l'inventaire national...</div>;

  const Section = ({ title, items, icon: Icon, color }: { title: string, items: Lieu[], icon: any, color: string }) => (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <Icon className={color} size={28} />
        <h2 className="text-2xl font-serif font-bold text-slate-800">{title}</h2>
        <span className="ml-auto bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
          {items.length} sites
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold">
              <MapPin size={16} className={color} />
              {item.ville}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "{item.description}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fcfaf7] p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-10 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium uppercase tracking-tighter">Retour à l'Acceuil</span>
        </Link>

        <header className="mb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4">
            Remparts & Fortifications
          </h1>
          <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-slate-500 max-w-2xl mx-auto uppercase text-sm tracking-[0.2em] font-bold">
            Inventaire global par importance patrimoniale
          </p>
        </header>

        <Section 
          title="Les Pièces Maîtresses" 
          items={data.la_piece_maitresse} 
          icon={Crown} 
          color="text-amber-500" 
        />

        <Section 
          title="Vestiges Majeurs" 
          items={data.vestiges_majeurs} 
          icon={Castle} 
          color="text-indigo-600" 
        />

        <Section 
          title="Vestiges Partiels ou Discrets" 
          items={data.vestiges_partiels_ou_discrets} 
          icon={EyeOff} 
          color="text-slate-400" 
        />

        <footer className="mt-20 border-t border-slate-200 pt-8 text-center text-slate-400 text-xs tracking-widest uppercase">
          © 2026 Archive Nationale de l'Architecture Fortifiée
        </footer>
      </div>
    </main>
  );
}
