'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

/* ================= TYPES ================= */

interface GeoPoint {
  lat: number;
  lon: number;
}

interface GeoShape {
  geometry: {
    coordinates: number[][];
  };
}

interface Balade {
  id: string;
  nom: string;
  lieu: string;
  accessibilite: string;
  duree: string;
  distance: number;
  remarks: string;
  lien: string;
  geo_point_2d: GeoPoint;
  geo_shape: GeoShape;
}

type GroupedBalades = Record<string, Balade[]>;

/* ================= PAGE ================= */

export default function BaladePage() {
  const [balades, setBalades] = useState<Balade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs pour Leaflet (Méthode OTAN)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  /* ---------- 1. Chargement des données ---------- */
  useEffect(() => {
    fetch('/api/balade')
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        data.sort((a, b) => a.lieu.localeCompare(b.lieu));
        setBalades(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  /* ---------- 2. Initialisation sécurisée de la carte ---------- */
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isLoading) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapInstance.current) return; // Empêche le doublon

      // Création de l'instance
      mapInstance.current = L.map(mapRef.current).setView([43.6045, 1.444], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    // NETTOYAGE CRUCIAL (Evite l'erreur "already initialized")
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isLoading]);

  /* ---------- 3. Ajout des Marqueurs et Tracés (Polylines) ---------- */
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || balades.length === 0) return;

    const updateLayers = async () => {
      const L = (await import('leaflet')).default;

      balades.forEach((balade) => {
        // Icône personnalisée
        const customIcon = L.divIcon({
          className: 'custom-balade-icon',
          html: `<div style="background-color: #15803d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${balade.id}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Marqueur
        const marker = L.marker([balade.geo_point_2d.lat, balade.geo_point_2d.lon], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; color: black;">
            <strong>${balade.nom}</strong><br/>
            <em>${balade.lieu}</em><br/>
            ⏱ ${balade.duree} — 📏 ${balade.distance} km<br/>
            ${balade.lien ? `<a href="${balade.lien}" target="_blank" style="color: #3b82f6;">Voir →</a>` : ''}
          </div>
        `);
        marker.addTo(mapInstance.current);

        // Tracé (Polyline)
        if (balade.geo_shape?.geometry?.coordinates) {
          const polylinePoints = balade.geo_shape.geometry.coordinates.map(coord => [coord[1], coord[0]]) as [number, number][];
          L.polyline(polylinePoints, { 
            color: '#16a34a', 
            weight: 3, 
            opacity: 0.7 
          }).addTo(mapInstance.current);
        }
      });
    };

    updateLayers();
  }, [isMapReady, balades]);

  /* ---------- Regroupement par lieu ---------- */
  const groupedBalades: GroupedBalades = balades.reduce((acc, balade) => {
    acc[balade.lieu] = acc[balade.lieu] || [];
    acc[balade.lieu].push(balade);
    return acc;
  }, {} as GroupedBalades);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <h1 className="text-3xl font-extrabold mb-4 text-green-700">
        🚶 Balades nature ({balades.length})
      </h1>

      {/* ZONE CARTE (DIV REF) */}
      <div className="mb-8 border rounded-lg bg-gray-100 overflow-hidden relative" style={{ height: '70vh', width: '100%' }}>
        <div ref={mapRef} className="h-full w-full z-0" />
        {(isLoading || !isMapReady) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <p className="animate-pulse text-green-700 font-bold">Chargement de la carte des balades...</p>
          </div>
        )}
      </div>

      {/* LISTE DES BALADES */}
      <div className="space-y-12">
        {Object.entries(groupedBalades).map(([lieu, items]) => (
          <div key={lieu}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-green-400">
              {lieu} ({items.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(balade => (
                <li key={balade.id} className="p-4 bg-white rounded-lg shadow border">
                  <p className="font-bold text-lg">{balade.id}. {balade.nom}</p>
                  <p className="text-sm text-gray-600">⏱ {balade.duree} — 📏 {balade.distance} km</p>
                  <p className="text-sm italic">{balade.accessibilite}</p>
                  {balade.lien && (
                    <a href={balade.lien} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                      Voir →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}