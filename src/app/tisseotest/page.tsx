"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Import dynamique de la carte
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

interface TisseoLine {
  geo_point_2d: { lon: number; lat: number };
  geo_shape: {
    geometry: {
      coordinates: [number, number][][];
    };
  };
}

export default function TisseoTestPage() {
  const [lines, setLines] = useState<TisseoLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tisseotest')
      .then(res => res.json())
      .then(data => {
        setLines(Array.isArray(data) ? data : [data]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10">Chargement du tracé...</div>;

  return (
    <main className="h-screen w-full p-4 flex flex-col gap-4">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>
      
      <h1 className="text-2xl font-bold text-blue-700 italic">Test Tracé Ligne Tisséo</h1>
      
      <div className="flex-1 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl">
        {typeof window !== 'undefined' && (
          <MapContainer 
            center={[43.5463, 1.5139]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {lines.map((line, idx) => {
              // Leaflet attend [lat, lon], le JSON fournit [lon, lat]
              const pathPositions = line.geo_shape.geometry.coordinates[0].map(
                coord => [coord[1], coord[0]] as [number, number]
              );

              return (
                <Polyline 
                  key={idx}
                  positions={pathPositions}
                  pathOptions={{ 
                    color: '#2563eb', 
                    weight: 5, 
                    opacity: 0.7,
                    lineJoin: 'round'
                  }}
                />
              );
            })}
          </MapContainer>
        )}
      </div>
    </main>
  );
}
