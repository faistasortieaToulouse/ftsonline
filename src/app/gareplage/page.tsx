"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, TrainFront, Waves, Info, Navigation, Footprints } from "lucide-react";

// Centre de la carte sur le littoral (entre l'Aude et les P.O)
const MAP_CENTER: [number, number] = [42.85, 3.05];

export default function GarePlagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Références pour Leaflet
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Chargement des données (ton code original)
  useEffect(() => {
    fetch('/api/gareplage')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur:", err);
        setLoading(false);
      });
  }, []);

  // 2. Initialisation de la carte (logique Leaflet)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (mapInstance.current) return;

      // Création de la carte
      mapInstance.current = L.map(mapRef.current!).setView(MAP_CENTER, 9);
      
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersLayer.current = L.layerGroup().addTo(mapInstance.current);
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading]);

  // 3. Ajout des marqueurs une fois la carte prête
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || !data?.gares) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      markersLayer.current.clearLayers();

      data.gares.forEach((gare: any, i: number) => {
        if (gare.lat && gare.lng) {
          // Couleur selon le type (Cyan pour Direct, Orange sinon)
          const markerColor = gare.type === 'Direct' ? '#06b6d4' : '#f97316';
          
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${markerColor}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">${i + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          L.marker([gare.lat, gare.lng], { icon: customIcon })
            .bindPopup(`<b style="color: #0891b2">${gare.nom}</b><br/>${gare.distance}`)
            .addTo(markersLayer.current);
        }
      });
    };

    updateMarkers();
  }, [isMapReady, data]);

  if (loading) return (
    <div className="p-20 text-center animate-pulse font-bold text-cyan-600 uppercase tracking-widest">
      Calcul de l'itinéraire vers la grande bleue...
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen my-10 shadow-2xl rounded-3xl border border-slate-200">
      
      <Link href="/" className="inline-flex items-center gap-2 text-cyan-600 font-black hover:bg-cyan-50 p-2 rounded-md transition-all mb-10">
        <ArrowLeft size={20} /> Retour à l'Accueil
      </Link>

      <header className="bg-slate-900 text-white p-10 rounded-3xl mb-12 shadow-inner border-b-4 border-cyan-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
              {data.titre}
            </h1>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
              <Navigation size={18} />
              <span>DESTINATION : LITTORAL OCCITAN</span>
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex gap-1 items-end h-12">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="w-1 bg-cyan-400 animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${1 + Math.random()}s` }}></div>
               ))}
             </div>
          </div>
        </div>
      </header>

      {/* --- BLOC CARTE LEAFLET (Ajouté) --- */}
      <div className="mb-16 border-4 border-white rounded-3xl bg-slate-200 h-[400px] relative z-0 overflow-hidden shadow-xl"> 
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <Waves size={32} className="text-cyan-600" />
          <h2 className="text-3xl font-black uppercase text-slate-800">Gares Pieds dans l'eau</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.gares.map((gare: any, i: number) => (
            <div key={i} className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-cyan-500 transition-all shadow-sm overflow-hidden">
              
              <div className="bg-slate-900 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-6 h-6 rounded-full border border-cyan-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  <TrainFront size={20} />
                  <span className="font-mono font-bold text-lg">{gare.nom}</span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30 uppercase font-bold">
                  {gare.departement}
                </span>
              </div>

              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-3">
                  <Footprints size={18} className="text-cyan-600" />
                  <span>{gare.distance}</span>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {gare.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border-l-4 border-cyan-500 flex gap-3">
                  <Info size={16} className="text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-xs italic text-slate-500">{gare.plus}</p>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${gare.type === 'Direct' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Accès : {gare.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center">
        <p className="font-mono text-slate-400 text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} Rail & Mer - Guide des mobilités douces Toulouse-Méditerranée
        </p>
      </footer>
    </main>
  );
}
