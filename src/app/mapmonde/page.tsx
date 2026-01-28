'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as topojson from 'topojson-client';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false });

export default function MapMondePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/mapmonde')
      .then(res => res.json())
      .then(topology => {
        // Conversion légère en mémoire
        const geojson = topojson.feature(topology, topology.objects.data);
        setData(geojson);
      });
  }, []);

  const countryStyle = {
    fillColor: "#0f172a",
    weight: 0.8,
    opacity: 1,
    color: '#334155', // Gris bleuté discret
    fillOpacity: 0.6
  };

  const onEachCountry = (feature: any, layer: any) => {
    // Ajout de l'étiquette volante
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, {
        sticky: true, // Suit la souris
        className: 'custom-tooltip', // Pour le style CSS
        direction: 'top',
        opacity: 0.9
      });
    }

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        target.setStyle({
          fillColor: "#1e3a8a",
          color: "#fde047", // Jaune constellation au survol
          fillOpacity: 0.8,
          weight: 2
        });
        target.bringToFront(); // Met les frontières au premier plan
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle(countryStyle);
      },
      click: (e: any) => {
        // Zoom sur le pays au clic
        const map = e.target._map;
        map.fitBounds(e.target.getBounds());
      }
    });
  };

  if (!data) return (
    <div className="bg-[#020617] h-screen flex items-center justify-center">
      <div className="text-blue-500 animate-pulse font-mono tracking-tighter">CHARGEMENT DES DONNÉES TERRESTRES...</div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#020617] p-4 relative">
      {/* Styles CSS injectés pour le tooltip */}
      <style jsx global>{`
        .custom-tooltip {
          background: #1e293b !important;
          border: 1px solid #3b82f6 !important;
          color: #fde047 !important;
          font-weight: bold !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          padding: 4px 10px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
        }
        .leaflet-container {
          background: #020617 !important;
        }
      `}</style>

      <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800">
        {/* @ts-ignore */}
        <MapContainer 
          center={[20, 0]} 
          zoom={2.5} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <GeoJSON 
            data={data} 
            style={countryStyle}
            onEachFeature={onEachCountry}
          />
        </MapContainer>
      </div>

      <div className="absolute bottom-10 left-10 pointer-events-none">
        <h1 className="text-slate-500 text-xs font-black uppercase tracking-[0.5em]">Global / Planisphère</h1>
      </div>
    </div>
  );
}
