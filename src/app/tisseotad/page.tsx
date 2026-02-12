"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowLeft, Bus, MapPin, Navigation } from "lucide-react";

const TadMap = dynamic(() => import('./TadMap'), { ssr: false });

export default function TisseoTadPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<any>(null); // Stocke l'instance de la carte

  useEffect(() => {
    fetch('/api/tisseotad')
      .then(res => res.json())
      .then(data => {
        setZones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fonction pour centrer la carte sur une zone spécifique
  const flyToZone = (zone: any) => {
    if (!map) return;
    const { lat, lon } = zone.geo_point_2d;
    map.flyTo([lat, lon], 13, { duration: 2 }); // Zoom niveau 13 avec animation
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-orange-600">CHARGEMENT...</div>;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b p-4 flex justify-between items-center shrink-0">
        <Link href="/" className="flex items-center gap-2 font-black text-slate-800 uppercase text-sm">
          <ArrowLeft size={18} /> Retour
        </Link>
        <div className="flex items-center gap-2 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-black">
          <Bus size={14} /> TISSÉO TAD
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LISTE DE GAUCHE */}
        <aside className="w-1/3 border-r bg-white overflow-y-auto p-6 space-y-6 shadow-inner">
          {zones.map((zone, i) => (
            <div key={i} className="border-2 border-slate-100 rounded-2xl p-5 hover:border-orange-500 transition-all bg-white shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-slate-400">ZONE #{zone.id_tad}</span>
                <div className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: `rgb(${zone.r},${zone.v},${zone.b})`}} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{zone.arret_dep}</h3>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 italic">Point de départ</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Communes desservies</p>
                <p className="text-[11px] leading-tight text-slate-600 font-medium">{zone.commune}</p>
              </div>

              <button 
                onClick={() => flyToZone(zone)}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase hover:bg-orange-600 transition-colors"
              >
                <Navigation size={14} /> Voir le périmètre
              </button>
            </div>
          ))}
        </aside>

        {/* CARTE À DROITE */}
        <section className="flex-1 relative bg-slate-200">
          <TadMap zones={zones} setMapInstance={setMap} />
        </section>
      </div>
    </main>
  );
}
