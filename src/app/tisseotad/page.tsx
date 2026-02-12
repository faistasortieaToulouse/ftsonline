"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, MapPin, Bus, Navigation, Info } from "lucide-react";

export default function TisseoTadPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseotad')
      .then(res => res.json())
      .then(data => {
        setZones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600">CHARGEMENT DES ZONES TAD...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-bold mb-8 transition-colors">
          <ArrowLeft size={20} /> Retour à l'Accueil
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <Bus className="text-orange-600" size={40} />
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
              Tisséo TAD<span className="text-orange-600">.</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium">Transport à la demande - Zones de couverture et arrêts de départ</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow group">
              {/* Header de la carte avec la couleur dynamique */}
              <div 
                className="h-3 w-full" 
                style={{ backgroundColor: `rgb(${zone.r}, ${zone.v}, ${zone.b})` }}
              />
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zone ID</span>
                    <h2 className="text-3xl font-black text-slate-800">#{zone.id_tad}</h2>
                  </div>
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `rgba(${zone.r}, ${zone.v}, ${zone.b}, 0.1)`, color: `rgb(${zone.r}, ${zone.v}, ${zone.b})` }}
                  >
                    <Navigation size={24} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <MapPin size={16} />
                      <span className="text-xs font-bold uppercase italic">Point de départ principal</span>
                    </div>
                    <p className="font-bold text-slate-700">{zone.arret_dep}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Info size={14} />
                      <span className="text-[10px] font-black uppercase">Communes desservies</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 font-medium">
                      {zone.commune.split(' / ').join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Couleur : {zone.couleur}</span>
                   <button className="text-xs font-black uppercase text-orange-600 group-hover:underline">Voir périmètre</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 py-10 text-center border-t border-slate-200">
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.5em]">Open Data Tisséo - 2026</p>
        </footer>
      </div>
    </main>
  );
}
