"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Globe, Search, Clock } from "lucide-react";

const MapWorld = dynamic(() => import('./MapWorld'), { 
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center font-mono text-slate-400">Chargement de la cartographie mondiale...</div>
});

// Liste de référence pour le tableau
const PAYS_DATA = [
  { pays: "France", ville: "Paris", zone: "Europe/Paris" },
  { pays: "États-Unis", ville: "New York", zone: "America/New_York" },
  { pays: "Japon", ville: "Tokyo", zone: "Asia/Tokyo" },
  { pays: "Australie", ville: "Sydney", zone: "Australia/Sydney" },
  { pays: "Inde", ville: "New Delhi", zone: "Asia/Kolkata" },
  { pays: "Brésil", ville: "Brasilia", zone: "America/Sao_Paulo" },
  { pays: "Royaume-Uni", ville: "Londres", zone: "Europe/London" },
  { pays: "Chine", ville: "Pékin", zone: "Asia/Shanghai" },
  { pays: "Afrique du Sud", ville: "Le Cap", zone: "Africa/Johannesburg" },
  { pays: "Émirats Arabes Unis", ville: "Dubaï", zone: "Asia/Dubai" },
];

export default function MondePage() {
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState("");

  // Mise à jour de l'heure chaque minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredPays = PAYS_DATA.filter(p => 
    p.pays.toLowerCase().includes(search.toLowerCase()) || 
    p.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white min-h-screen relative">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-black mb-8 uppercase text-sm mt-20 hover:translate-x-1 transition-transform">
        <ArrowLeft size={18} /> Retour à l'Accueil
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
          Horloge Mondiale <Globe className="text-blue-600" />
        </h1>
        <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">Temps Universel Coordonné (UTC) & Fuseaux Locaux</p>
      </header>

      {/* CARTE */}
      <section className="mb-12 relative shadow-2xl rounded-3xl overflow-hidden border-8 border-slate-50" style={{ zIndex: 1 }}>
        <MapWorld />
      </section>

      {/* TABLEAU DES HEURES */}
      <section className="mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic">Index des fuseaux</h2>
            <div className="h-1 w-20 bg-blue-600 mt-1"></div>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un pays..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
                <th className="p-4 font-black">Pays / État</th>
                <th className="p-4 font-black">Ville de référence</th>
                <th className="p-4 font-black text-right">Heure Locale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPays.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 text-sm font-bold text-slate-700">{item.pays}</td>
                  <td className="p-4 text-sm text-slate-500 font-medium">{item.ville}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-2 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white px-3 py-1 rounded-lg font-mono text-sm font-bold transition-colors">
                      <Clock size={12} />
                      {now.toLocaleTimeString("fr-FR", { 
                        timeZone: item.zone, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPays.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-sm italic">Aucun résultat trouvé.</div>
          )}
        </div>
      </section>

      <footer className="mt-20 pb-10 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Observatoire Chronos • 2026</p>
      </footer>
    </main>
  );
}
