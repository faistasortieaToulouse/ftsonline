'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { ClocherMurSite } from '../../../api/clochermur/route';

const CENTER_LAURAGAIS = { lat: 43.48, lng: 1.65 };

export default function ClocherMurMapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [sitesData, setSitesData] = useState<ClocherMurSite[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch des données
  useEffect(() => {
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

  // 2. Initialisation Google Maps
  useEffect(() => {
    if (!isReady || !mapRef.current || !window.google || sitesData.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 10,
      center: CENTER_LAURAGAIS,
      gestureHandling: "greedy",
    });

    mapInstance.current = map;

    sitesData.forEach((site, index) => {
      const marker = new google.maps.Marker({
        position: { lat: site.lat, lng: site.lng },
        map: map,
        title: site.commune,
        label: { text: String(index + 1), color: "white" }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="color:black; padding:5px;">
                    <strong>${site.commune} (${site.dept})</strong><br/>
                    ${site.description}<br/>
                    <small>${site.secteur} - ${site.distanceKm}km de Toulouse</small>
                  </div>`
      });

      marker.addListener("click", () => infoWindow.open(map, marker));
    });
  }, [isReady, sitesData]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Script 
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        onLoad={() => setIsReady(true)}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔔 Églises à clochers-murs de style midi-toulousain</h1>
        
        {/* AFFICHAGE DU TOTAL ICI */}
        {!isLoading && (
          <p className="text-gray-600 mt-2 font-medium">
            Total : <span className="text-blue-600">{sitesData.length}</span> églises répertoriées
          </p>
        )}
      </div>
      
      <div ref={mapRef} style={{ height: "60vh", width: "100%" }} className="rounded-xl border shadow-inner bg-slate-50 mb-6">
        {!isReady && <div className="flex h-full items-center justify-center">Chargement de la carte...</div>}
      </div>

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
              <tr key={site.id} className="hover:bg-blue-50">
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