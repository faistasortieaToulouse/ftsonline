'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface ParcJardin {
  id: number;
  name: string;
  adresse: string;
  lat: number;
  lng: number;
  type: string;
  quartier: string | number;
  commune: string;
  territoire: string;
}

const API_BASE = "/api/parcjardin";

export default function ParcJardinPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [items, setItems] = useState<ParcJardin[]>([]);
  const [markersCount, setMarkersCount] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.adresse.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.quartier.toString().toLowerCase().includes(q) ||
      item.commune.toLowerCase().includes(q) ||
      item.territoire.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.google?.maps || filteredItems.length === 0) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 43.6045, lng: 1.444 },
      gestureHandling: "greedy",
    });
    mapInstance.current = map;

    filteredItems.forEach((item, i) => {
      const marker = new google.maps.Marker({
        map: mapInstance.current,
        position: { lat: item.lat, lng: item.lng },
        title: item.name,
        label: String(i + 1),
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial; font-size: 14px;">
            <strong>${i + 1}. ${item.name}</strong><br/>
            <b>Type :</b> ${item.type}<br/>
            <b>Adresse :</b> ${item.adresse}<br/>
            <b>Quartier :</b> ${item.quartier}<br/>
            <b>Commune :</b> ${item.commune}<br/>
            <b>Territoire :</b> ${item.territoire}
          </div>
        `,
      });

      marker.addListener("click", () => info.open({ anchor: marker, map: mapInstance.current! }));
    });

    setMarkersCount(filteredItems.length);
  }, [isMapReady, filteredItems]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsMapReady(true)}
      />

      <h1 className="text-3xl font-bold mb-4">Espaces verts et parcs de Toulouse</h1>
      <p className="mb-4 font-semibold">{markersCount} lieux affichés sur {filteredItems.length} espaces verts.</p>

      <input
        type="text"
        placeholder="Rechercher un parc ou jardin..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
      />

      {error && <div className="mt-6 p-4 border border-red-500 bg-red-50 text-red-700 rounded"><strong>Erreur :</strong> {error}</div>}

      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-6 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isMapReady && <p>Chargement de la carte…</p>}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th style={{ padding: "8px", border: "1px solid #ddd", width: "5%" }}>#</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Nom</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Type</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Adresse</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Quartier</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Commune</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Territoire</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, i) => (
            <tr key={`${item.id}-${item.type}-${i}`} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
              <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: 'bold' }}>{i + 1}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.name}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.type}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.adresse}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.quartier}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.commune}</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{item.territoire}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
