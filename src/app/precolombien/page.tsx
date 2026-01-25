'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Types
interface Civilisation {
  culture: string;
  periode: string;
  localisation: string;
  coordonnees: { lat: number; lon: number };
  description?: string;
}

interface DataStructure {
  civilisations_precolombiennes: {
    [region: string]: Civilisation[];
  };
}

export default function VisitePrecolombiennePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});

  const [data, setData] = useState<DataStructure | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données
  useEffect(() => {
    fetch("/api/precolombien")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error);
  }, []);

  // 2. STABILISATION : On utilise useMemo pour que la référence du tableau 
  // ne change pas à chaque rendu si les données sont les mêmes.
  const civilisationsList = useMemo(() => {
    if (!data) return [];
    return Object.values(data.civilisations_precolombiennes).flat();
  }, [data]);

  // 3. Initialisation Leaflet (Méthode OTAN)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || civilisationsList.length === 0) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Création de l'instance si elle n'existe pas
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current!).setView([15, -85], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
      }

      // Nettoyer les marqueurs existants
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};

      civilisationsList.forEach((civ, i) => {
        const numero = i + 1;
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #78350f; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${numero}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([civ.coordonnees.lat, civ.coordonnees.lon], { icon: customIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>${numero}. ${civ.culture}</strong><br><small>${civ.periode}</small>`);

        markersRef.current[numero] = marker;
      });

      setIsReady(true);
    };

    initMap();

    // On ne supprime pas mapInstance.current.remove() ici car sinon la carte 
    // clignote/disparaît dès que la liste change. On le garde pour le démontage réel.
  }, [civilisationsList]); // Dépendance stable grâce au useMemo

  const handleFocusPlace = (numero: number) => {
    const marker = markersRef.current[numero];
    if (marker && mapInstance.current) {
      mapInstance.current.setView(marker.getLatLng(), 8, { animate: true });
      marker.openPopup();
      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-[#fdfcf8] min-h-screen">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-amber-900 border-b-4 border-amber-700 inline-block">
        🗺️ Carte des Civilisations Anciennes des Amériques
      </h1>

      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%", zIndex: 0 }}
        className="mb-8 border-4 border-white rounded-xl shadow-2xl bg-gray-200"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full italic text-amber-900">
            Chargement de la carte et des cultures...
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-amber-800">
        Sites et Cultures ({civilisationsList.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {civilisationsList.map((civ, i) => {
          const numero = i + 1;
          return (
            <div 
              key={`${civ.culture}-${i}`} 
              onClick={() => handleFocusPlace(numero)}
              className="p-5 border border-amber-100 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                  {numero}
                </span>
                <h3 className="text-xl font-bold text-amber-900 group-hover:text-amber-600">
                  {civ.culture}
                </h3>
              </div>
              
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold text-amber-700">{civ.periode}</p>
                <p className="italic">📍 {civ.localisation}</p>
                {civ.description && <p className="mt-3 text-gray-600 line-clamp-3">{civ.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}