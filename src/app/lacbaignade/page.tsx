'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Waves, MapPin, Navigation, Loader2 } from "lucide-react";

export default function LacsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lacbaignade')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors font-medium">
          <ArrowLeft size={18} />
          Retour
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Waves className="text-blue-500" size={36} />
            Lacs & Bases <span className="text-blue-600">de Loisirs</span>
          </h1>
          <p className="text-slate-600 mt-2 text-lg italic">
            Sélection de spots de baignade autour de Toulouse.
          </p>
        </header>

        {Object.entries(data).map(([departement, lacs]: any) => (
          <section key={departement} className="mb-16">
            <h2 className="text-xl font-bold text-white bg-slate-800 inline-block px-4 py-1 rounded-lg mb-8 shadow-sm">
              {departement}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lacs.map((lac: any, idx: number) => (
                <div key={idx} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-extrabold text-xl text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {lac.nom}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                      <MapPin size={14} />
                      <span className="font-medium text-slate-500">{lac.ville}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-600 font-bold">{lac.distance_toulouse}</span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {lac.description}
                    </p>

                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lac.lat},${lac.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-800 py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all group/btn"
                    >
                      <Navigation size={16} className="group-hover/btn:animate-pulse" />
                      Y aller
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
