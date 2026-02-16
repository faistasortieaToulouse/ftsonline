"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import dynamique de la carte pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function PubToulousePage() {
  const [pubs, setPubs] = useState<any[]>([]);

  useEffect(() => {
    // Correction des icônes Leaflet pour Next.js
    import('leaflet').then((leaflet) => {
      const DefaultIcon = leaflet.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      leaflet.L.Marker.prototype.options.icon = DefaultIcon;
    });

    // Récupération des données depuis l'API
    fetch('/api/pubtoulouse')
      .then(res => res.json())
      .then(setPubs);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
          Toulouse <span className="text-amber-600">Pub Crawl</span>
        </h1>
        <p className="text-slate-600">
          La carte interactive des pubs britanniques, irlandais et écossais de la Ville Rose.
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Barre latérale : Liste dynamique importée de l'API */}
        <aside className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-lg border border-slate-100 flex flex-col h-[700px]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-slate-800">Établissements</h2>
          <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {/* On groupe par catégorie pour plus de clarté */}
            {Array.from(new Set(pubs.map(p => p.category))).map(cat => (
              <div key={cat}>
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">{cat}</h3>
                <ul className="space-y-2">
                  {pubs.filter(p => p.category === cat).map((pub, i) => (
                    <li key={i} className="p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-default group">
                      <p className="font-bold text-slate-800 text-sm group-hover:text-amber-800">{pub.name}</p>
                      <p className="text-[10px] text-slate-400 italic leading-tight">{pub.address}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* La Carte : Utilise les données de l'API */}
        <div className="lg:col-span-3 h-[700px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative">
          {typeof window !== "undefined" && (
            <MapContainer center={[43.6047, 1.4442] as any} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap France'
              />
              {pubs.map((pub, i) => (
                <Marker key={i} position={pub.coords}>
                  <Popup>
                    <div className="text-center font-sans p-1">
                      <strong className="text-amber-700 text-sm">{pub.name}</strong><br/>
                      <span className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">{pub.category}</span><br/>
                      <p className="text-[11px] text-slate-600 mt-1">{pub.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </main>
  );
}
