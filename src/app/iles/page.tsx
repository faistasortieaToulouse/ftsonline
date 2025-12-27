'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MapPin, Info } from "lucide-react";

interface Ile {
  id: number;
  nom: string;
  description: string;
  lat: number;
  lng: number;
}

export default function IlesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [iles, setIles] = useState<Ile[]>([]);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch('/api/iles')
      .then(res => res.json())
      .then(data => setIles(data))
      .catch(err => console.error("Erreur API:", err));
  }, []);

  // 2. Initialiser la carte
  useEffect(() => {
    if (!isReady || !mapRef.current || iles.length === 0) return;

    // Création de la carte
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 13.5,
      center: { lat: 43.585, lng: 1.435 },
      gestureHandling: 'greedy',
      mapId: 'DEMO_MAP_ID', // Optionnel
    });

    // Nettoyage des anciens marqueurs
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Ajout des marqueurs pour chaque île
    iles.forEach((ile) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: ile.lat, lng: ile.lng },
        label: {
            text: ile.id.toString(),
            color: "white",
            fontWeight: "bold"
        },
        title: ile.nom,
      });

      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1e293b; padding: 5px;">
            <strong style="font-size: 14px;">${ile.nom}</strong><br/>
            <p style="font-size: 12px; margin-top: 5px; color: #64748b;">${ile.description}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infowindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [isReady, iles]);

  // Fonction pour centrer sur une île via le tableau
  const focusOnIle = (ile: Ile) => {
    if (mapInstance.current) {
      mapInstance.current.setZoom(16);
      mapInstance.current.panTo({ lat: ile.lat, lng: ile.lng });
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-slate-50">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <MapPin size={20} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Archipel de la Garonne</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Tableau */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold text-center">#</th>
                <th className="p-4 border-b text-xs text-slate-400 uppercase font-bold">Îlot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {iles.map((ile) => (
                <tr 
                  key={ile.id} 
                  onClick={() => focusOnIle(ile)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 text-center">
                    <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white font-bold text-xs transition-colors">
                      {ile.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-700">{ile.nom}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{ile.description}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Carte Google Maps */}
        <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden shadow-sm border">
          <div ref={mapRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}