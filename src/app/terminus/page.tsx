"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Terminus {
  geo_point: { lon: number; lat: number };
  geo_shape: { type: string; geometry: { coordinates: [number, number]; type: string }; properties: {} };
  annee_reference: string;
  ref: string;
  nom: string;
  x_wgs84: number;
  y_wgs84: number;
}

export default function TerminusPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null); // Leaflet Map
  const markersRef = useRef<Map<string, any>>(new Map()); // Leaflet Markers
  
  const [terminus, setTerminus] = useState<Terminus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Récupération des données
  useEffect(() => {
    fetch("/api/terminus")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: Terminus, b: Terminus) => {
          const nameCompare = (a.nom ?? "").localeCompare(b.nom ?? "");
          if (nameCompare !== 0) return nameCompare;
          const aYear = a.annee_reference === "SPECIAL" ? Infinity : parseInt(a.annee_reference);
          const bYear = b.annee_reference === "SPECIAL" ? Infinity : parseInt(b.annee_reference);
          return aYear - bYear;
        });
        setTerminus(sorted);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  // 2. Initialisation de Leaflet (Méthode OTAN / Import dynamique)
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    let L: any;
    const initMap = async () => {
      L = (await import("leaflet")).default;

      if (mapInstance.current) return;

      // Initialisation de la carte
      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      // Ajout des marqueurs une fois la carte prête
      terminus.forEach((t, index) => {
        const key = `${t.ref}-${t.annee_reference}-${index}`;
        
        // Création d'une icône circulaire personnalisée (comme votre SVG Google)
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div style="
              background-color: #7c3aed;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              border: 2px solid #a78bfa;
              font-size: 11px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        const marker = L.marker([t.geo_point.lat, t.geo_point.lon], { icon: customIcon })
          .bindPopup(`<strong>${t.nom}</strong><br/>Année : ${t.annee_reference}<br/>Ref : ${t.ref}`)
          .addTo(mapInstance.current);

        markersRef.current.set(key, marker);
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [terminus, isLoading]);

  // 3. Interaction Tableau -> Carte
  const handleRowClick = (t: Terminus, index: number) => {
    const key = `${t.ref}-${t.annee_reference}-${index}`;
    const marker = markersRef.current.get(key);

    if (mapInstance.current && marker) {
      mapInstance.current.setView(marker.getLatLng(), 15, { animate: true });
      marker.openPopup();
      mapRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-6 text-center text-purple-800">
        🚌 Terminus des transports en commun à Toulouse
      </h1>

      {/* Conteneur de la carte */}
      <div 
        ref={mapRef} 
        className="h-[600px] w-full border rounded-lg bg-gray-100 z-0" 
      />

      {/* Tableau des terminus */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-sm">
          <thead>
            <tr className="bg-purple-100">
              <th className="border p-2">#</th>
              <th className="border p-2">Nom</th>
              <th className="border p-2">Année</th>
              <th className="border p-2">Ref</th>
            </tr>
          </thead>
          <tbody>
            {terminus.map((t, index) => (
              <tr
                key={`${t.ref}-${t.annee_reference}-${index}`}
                className="hover:bg-purple-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(t, index)}
              >
                <td className="border p-2 text-center font-bold text-purple-700">{index + 1}</td>
                <td className="border p-2">{t.nom}</td>
                <td className="border p-2 text-center">{t.annee_reference}</td>
                <td className="border p-2 text-sm text-gray-600">{t.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isLoading && (
        <div className="text-center mt-4">
          <p className="animate-pulse">Chargement des données...</p>
        </div>
      )}
    </div>
  );
}