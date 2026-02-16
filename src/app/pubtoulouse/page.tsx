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
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Chargement de l'icône Leaflet (correction bug Next.js)
    import('leaflet').then((leaflet) => {
      const DefaultIcon = leaflet.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      leaflet.L.Marker.prototype.options.icon = DefaultIcon;
      setL(leaflet.L);
    });

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
        <p className="text-slate-600">La carte interactive des pubs britanniques de la Ville Rose.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des Pubs */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-lg overflow-y-auto max-h-[600px]">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Les Adresses</h2>
          {pubs.map((pub, i) => (
            <div key={i} className="mb-3 p-3 hover:bg-amber-50 rounded-lg border border-slate-100 transition-colors">
              <p className="font-bold text-slate-800">{pub.name}</p>
              <p className="text-xs text-slate-500">{pub.address}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-slate-200 px-2 py-0.5 rounded">
                {pub.category}
              </span>
            </div>
          ))}
        </div>

        {/* La Carte */}
        <div className="lg:col-span-2 h-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          {typeof window !== "undefined" && (
            <MapContainer center={[43.6047, 1.4442] as any} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {pubs.map((pub, i) => (
                <Marker key={i} position={pub.coords}>
                  <Popup>
                    <div className="text-center">
                      <strong className="text-amber-700">{pub.name}</strong><br/>
                      <span className="text-slate-500 text-xs">{pub.category}</span>
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
