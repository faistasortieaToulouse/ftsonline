"use client";
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TisseoTestPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Import dynamique de Leaflet uniquement côté client
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (!mapRef.current || mapInstance.current) return;

      // 2. Initialisation de la carte
      mapInstance.current = L.map(mapRef.current).setView([43.6047, 1.4442], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapInstance.current);

      try {
        // 3. Récupération des données
        const res = await fetch('/api/lignetisseo');
        const data = await res.json();
        const lines = Array.isArray(data) ? data : [data];

        // 4. Dessin des tracés avec vérification de structure
        lines.forEach((line) => {
          const coords = line?.geo_shape?.geometry?.coordinates;
          
          if (coords && Array.isArray(coords[0])) {
            // Inversion [lon, lat] -> [lat, lon] pour Leaflet
            const pathPositions = coords[0].map((coord: number[]) => [coord[1], coord[0]]);
            
            L.polyline(pathPositions as any, {
              color: '#2563eb',
              weight: 5,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(mapInstance.current);

            // Ajuster la vue sur le tracé
            const bounds = L.polyline(pathPositions as any).getBounds();
            mapInstance.current.fitBounds(bounds);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement tracé:", error);
        setLoading(false);
      }
    };

    initMap();

    // Nettoyage de la carte au démontage du composant
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <main className="h-screen w-full p-4 flex flex-col bg-slate-50">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-blue-600 italic">Tracé Tisséo (Leaflet Natif)</h1>
        {loading && <p className="text-sm text-gray-500">Chargement des données...</p>}
      </div>
      
      <div 
        ref={mapRef} 
        className="flex-1 rounded-2xl border-2 border-white shadow-2xl overflow-hidden"
        style={{ minHeight: '500px' }}
      />
    </main>
  );
}
