'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ClocherMurSite } from '../../../api/clochermur/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

// --- Imports dynamiques pour Leaflet (SSR Safe) ---
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const CENTER_LAURAGAIS: [number, number] = [43.48, 1.65];

export default function ClocherMurMapPage() {
  const [sitesData, setSitesData] = useState<ClocherMurSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [L, setL] = useState<any>(null);

  // 1. Fetch des données et chargement de l'objet Leaflet
  useEffect(() => {
    // Importation de Leaflet pour les icônes personnalisées
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });

    async function fetchSites() {
      try {
        const response = await fetch('/api/clochermur');
        if (!response.ok) throw new Error('Erreur API');
        let data: ClocherMurSite[] = await response.json();
        // Tri par ordre alphabétique des communes
        data.sort((a, b) => a.commune.localeCompare(b.commune, 'fr'));
        setSitesData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSites();
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔔 Églises à clochers-murs de style midi-toulousain</h1>
        
        {!isLoading && (
          <p className="text-gray-600 mt-2 font-medium">
            Total : <span className="text-blue-600">{sitesData.length}</span> églises répertoriées
          </p>
        )}
      </div>
      
      {/* --- Zone de la Carte Leaflet --- */}
      <div className="rounded-xl border shadow-inner bg-slate-50 mb-6 h-[60vh] overflow-hidden relative">
        {isLoading || !L ? (
          <div className="flex h-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin" />
              <p>Chargement de la carte...</p>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={CENTER_LAURAGAIS} 
            zoom={10} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {sitesData.map((site, index) => {
              // Création d'un marqueur numéroté (similaire au label Google Maps)
              const icon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });

              return (
                <Marker key={site.id} position={[site.lat, site.lng]} icon={icon}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-blue-700">{site.commune} (${site.dept})</strong><br/>
                      <p className="my-1 leading-tight">{site.description}</p>
                      <small className="text-gray-500 font-medium">${site.secteur} - ${site.distanceKm}km de Toulouse</small>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* --- Tableau (Contenu et mise en page conservés) --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">#</th>
              <th className="border p-2 text-left">Commune</th>
              <th className="border p-2 text-center">Dépt</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-center">Distance</th>
            </tr>
          </thead>
          <tbody>
            {sitesData.map((site, i) => (
              <tr key={site.id} className="hover:bg-blue-50 transition-colors">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2 font-medium">{site.commune}</td>
                <td className="border p-2 text-center text-gray-600">{site.dept}</td>
                <td className="border p-2">{site.description}</td>
                <td className="border p-2 text-center">{site.distanceKm} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
