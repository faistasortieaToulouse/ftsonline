"use client";
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Zap, Mic, BookOpen, Database, MessageSquare } from "lucide-react";

// Correction icônes Leaflet par défaut
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RadarTisseoPage() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ici l'appel à ton API Route qui utilise ta clé API Tisséo
    fetch('/api/tisseo/passages')
      .then(res => res.json())
      .then(data => {
        setPassages(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black italic uppercase italic">
            Radar<span className="text-red-600">.Toulouse</span>
          </h1>
        </header>

        {/* 1. LA CARTE LEAFLET */}
        <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border border-white/10 mb-12">
          <MapContainer center={[43.6047, 1.4442]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {/* Exemple de marqueur pour un arrêt Tisséo */}
            <Marker position={[43.6045, 1.4440]} icon={icon}>
              <Popup>Station Jean Jaurès - Flux en direct</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* 2. STATS EN DUR (PODCASTS / LIVRES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-2xl flex items-center gap-4">
              <Mic className="text-purple-400" size={40} />
              <div>
                <p className="text-2xl font-black">1708</p>
                <p className="text-xs uppercase text-slate-500">Podcasts sorties de livre</p>
              </div>
           </div>
           <div className="p-6 bg-orange-900/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
              <BookOpen className="text-orange-400" size={40} />
              <div>
                <p className="text-2xl font-black">4266</p>
                <p className="text-xs uppercase text-slate-500">Livres suggérés</p>
              </div>
           </div>
        </div>

        {/* 3. TRI DES DONNÉES PAR LIGNE (FLUX LIVE) */}
        <section className="bg-slate-900/20 border border-white/5 p-8 rounded-[3rem]">
          <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" /> Prochains Passages (v2)
          </h2>
          
          <div className="space-y-4">
            {passages.length > 0 ? passages.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border-l-4 border-l-red-600">
                <div className="flex items-center gap-4">
                  <span className="bg-white text-black font-black px-3 py-1 rounded text-sm">
                    {p.lineShortName || "22"}
                  </span>
                  <div>
                    <p className="font-bold text-sm uppercase">{p.destinationName || "Gonin"}</p>
                    <p className="text-[10px] text-slate-500">ID: {p.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-yellow-400">{p.expectedDepartureTime}</p>
                  <p className="text-[10px] uppercase text-slate-500">Temps réel</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 italic">En attente des données Tisséo...</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
