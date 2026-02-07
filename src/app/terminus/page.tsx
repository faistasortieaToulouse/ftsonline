"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
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
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  
  const [terminus, setTerminus] = useState<Terminus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (mapInstance.current) return;

      mapInstance.current = L.map(mapRef.current!).setView([43.6045, 1.444], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      terminus.forEach((t, index) => {
        const key = `${t.ref}-${t.annee_reference}-${index}`;
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #7c3aed; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid #a78bfa; font-size: 11px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
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
        🚌 Terminus de Toulouse
      </h1>

      <div ref={mapRef} className="h-[500px] w-full border rounded-lg bg-gray-100 shadow-inner z-0 overflow-hidden relative" >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
             <p className="animate-pulse font-medium text-purple-600">Chargement des terminus...</p>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden shadow-sm border rounded-lg bg-white">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-purple-100 text-purple-900">
              <th className="p-3 text-left w-12 text-sm font-bold">#</th>
              <th className="p-3 text-left text-sm font-bold">Nom du Terminus</th>
              <th className="p-3 text-center text-sm font-bold hidden md:table-cell">Année</th>
              <th className="p-3 text-left text-sm font-bold hidden md:table-cell">Référence</th>
            </tr>
          </thead>
          <tbody>
            {terminus.map((t, index) => (
              <TerminusRow 
                key={`${t.ref}-${t.annee_reference}-${index}`} 
                t={t} 
                index={index} 
                onClick={() => handleRowClick(t, index)} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TerminusRow({ t, index, onClick }: { t: Terminus; index: number; onClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 even:bg-gray-50/30"
        onClick={() => {
          setIsOpen(!isOpen);
          onClick();
        }}
      >
        <td className="p-3 text-center font-bold text-purple-700">{index + 1}</td>
        <td className="p-3 font-medium text-gray-800">
          <div className="flex items-center justify-between">
            {t.nom}
            <span className="md:hidden text-purple-400">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </div>
        </td>
        <td className="p-3 text-center text-gray-700 hidden md:table-cell">{t.annee_reference}</td>
        <td className="p-3 text-sm text-gray-600 hidden md:table-cell italic">{t.ref}</td>
      </tr>

      {/* Accordéon Mobile */}
      {isOpen && (
        <tr className="md:hidden bg-purple-50/50">
          <td colSpan={2} className="p-4 border-b border-purple-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-purple-800">Année</span>
                <span className="text-gray-700">{t.annee_reference}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-bold text-purple-800">Réf</span>
                <span className="text-gray-600 italic">{t.ref}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}