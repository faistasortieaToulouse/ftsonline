'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

/* ================= TYPES ================= */

interface GeoPoint {
  lat: number;
  lon: number;
}

interface GeoShape {
  geometry: {
    coordinates: number[][]; // Leaflet préfère souvent un tableau simple de coordonnées pour les polylines
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

/* ================= COMPOSANTS DYNAMIQUES ================= */

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

/* ================= PAGE ================= */

export default function BaladePage() {
  const [balades, setBalades] = useState<Balade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  /* ---------- Chargement des données ---------- */
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });

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

  /* ---------- Icône personnalisée Leaflet ---------- */
  const createIcon = (id: string) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-balade-icon',
      html: `<div style="background-color: #15803d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${id}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

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

      {/* ---------- CARTE LEAFLET ---------- */}
      <div className="mb-8 border rounded-lg bg-gray-100 overflow-hidden" style={{ height: '70vh', width: '100%' }}>
        {!isLoading && typeof window !== 'undefined' ? (
          <MapContainer center={[43.6045, 1.444]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {balades.map((balade) => {
              const icon = createIcon(balade.id);
              
              // Préparation des coordonnées du tracé (Polyline)
              // Note: Dans GeoJSON c'est [lng, lat], Leaflet veut [lat, lng]
              const polylinePoints = balade.geo_shape?.geometry?.coordinates?.map(coord => [coord[1], coord[0]]) as [number, number][];

              return (
                <div key={balade.id}>
                  {/* Marqueur 📍 */}
                  {icon && (
                    <Marker position={[balade.geo_point_2d.lat, balade.geo_point_2d.lon]} icon={icon}>
                      <Popup>
                        <div style={{ fontFamily: 'sans-serif' }}>
                          <strong>{balade.nom}</strong><br/>
                          <em>{balade.lieu}</em><br/>
                          ⏱ {balade.duree} — 📏 {balade.distance} km<br/>
                          {balade.lien && <a href={balade.lien} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Voir →</a>}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Tracé de la balade 🧭 */}
                  {polylinePoints && (
                    <Polyline 
                      positions={polylinePoints} 
                      pathOptions={{ color: '#16a34a', weight: 3, opacity: 0.7 }} 
                    />
                  )}
                </div>
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Chargement de la carte...
          </div>
        )}
      </div>

      {/* ---------- LISTE DES BALADES (Inchangée) ---------- */}
      <div className="space-y-12">
        {Object.entries(groupedBalades).map(([lieu, items]) => (
          <div key={lieu}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-green-400">
              {lieu} ({items.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(balade => (
                <li
                  key={balade.id}
                  className="p-4 bg-white rounded-lg shadow border"
                >
                  <p className="font-bold text-lg">
                    {balade.id}. {balade.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    ⏱ {balade.duree} — 📏 {balade.distance} km
                  </p>
                  <p className="text-sm italic">
                    {balade.accessibilite}
                  </p>

                  {balade.lien && (
                    <a
                      href={balade.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm"
                    >
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
