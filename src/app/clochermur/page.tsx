'use client';

import { useEffect, useState, useRef } from "react";
import type { ClocherMurSite } from '../../../api/clochermur/route';
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const CENTER_LAURAGAIS: [number, number] = [43.48, 1.65];

export default function ClocherMurMapPage() {
  const [sitesData, setSitesData] = useState<ClocherMurSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- REFS pour la Méthode OTAN ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Fetch des données
  useEffect(() => {
    async function fetchSites() {
      try {
        const response = await fetch('/api/clochermur');
        if (!response.ok) throw new Error('Erreur API');
        let data: ClocherMurSite[] = await response.json();
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

  // 2. Initialisation MANUELLE de la carte
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      // Si une instance existe déjà, on ne fait rien
      if (mapInstance.current) return;

      // Création de l'instance sur la DIV via la ref
      mapInstance.current = L.map(mapRef.current).setView(CENTER_LAURAGAIS, 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      setIsMapReady(true);
    };

    initMap();

    // NETTOYAGE : Destruction propre au démontage
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Mise à jour des Marqueurs (se déclenche quand isMapReady ou sitesData change)
  useEffect(() => {
    if (!isMapReady || !mapInstance.current || sitesData.length === 0) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Nettoyage des anciens marqueurs
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });

      // Ajout des nouveaux marqueurs numérotés
      sitesData.forEach((site, index) => {
        const icon = L.divIcon({
          className: 'custom-icon',
          html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([site.lat, site.lng], { icon })
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 150px;">
              <strong style="color: #1d4ed8;">${site.commune} (${site.dept})</strong><br/>
              <p style="margin: 4px 0; font-size: 12px; line-height: 1.2;">${site.description}</p>
              <hr style="margin: 4px 0; border: 0; border-top: 1px solid #eee;" />
              <small style="color: #666;">${site.secteur} - ${site.distanceKm}km de Toulouse</small>
            </div>
          `)
          .addTo(mapInstance.current);
      });
    };

    updateMarkers();
  }, [isMapReady, sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold">
          <ArrowLeft size={20} /> Retour à l'accueil
        </Link>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">🔔 Églises à clochers-murs de style midi-toulousain</h1>
        {!isLoading && (
          <p className="text-gray-600 mt-2 font-medium">
            Total : <span className="text-blue-600">{sitesData.length}</span> églises répertoriées
          </p>
        )}
      </div>
      
      {/* Zone de la Carte (Conteneur vide piloté par Ref) */}
      <div className="rounded-xl border shadow-inner bg-slate-100 mb-6 h-[60vh] overflow-hidden relative">
        <div ref={mapRef} className="h-full w-full z-0" />
        
        {(isLoading || !isMapReady) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 className="animate-spin" />
              <p>Initialisation de la carte...</p>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des sites */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b p-3 text-left text-sm font-bold">#</th>
              <th className="border-b p-3 text-left text-sm font-bold">Commune</th>
              <th className="border-b p-3 text-center text-sm font-bold">Dépt</th>
              <th className="border-b p-3 text-left text-sm font-bold">Description</th>
              <th className="border-b p-3 text-center text-sm font-bold">Distance</th>
            </tr>
          </thead>
          <tbody>
            {sitesData.map((site, i) => (
              <tr key={site.id} className="hover:bg-blue-50 transition-colors">
                <td className="border-b p-3 text-sm">{i + 1}</td>
                <td className="border-b p-3 text-sm font-medium">{site.commune}</td>
                <td className="border-b p-3 text-sm text-center text-gray-600">{site.dept}</td>
                <td className="border-b p-3 text-sm italic">{site.description}</td>
                <td className="border-b p-3 text-sm text-center">{site.distanceKm} km</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}