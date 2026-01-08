'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface EtatUSA {
  nom: string;
  genre: string;
  ordre_entree: number;
  date_entree: string;
  description: string;
}

export default function EtatsUSAPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [etats, setEtats] = useState<EtatUSA[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- Charger les données ---
  useEffect(() => {
    fetch("/api/EtatsUSA")
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEtats(data);
        }
      })
      .catch(console.error);
  }, []);

  // --- Carte Google Maps ---
  useEffect(() => {
    if (!isReady || !mapRef.current || etats.length === 0) return;

    // Centrage sur le centre des USA
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 39.8283, lng: -98.5795 },
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    etats.forEach((etat) => {
      // On précise "USA" pour éviter les erreurs de géocodage (ex: Paris, Texas)
      const recherche = `${etat.nom}, USA`;

      geocoder.geocode({ address: recherche }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const marker = new google.maps.Marker({
            map: mapInstance.current!,
            position: results[0].geometry.location,
            label: {
              text: etat.ordre_entree.toString(),
              color: "white",
              fontWeight: "bold"
            },
            title: etat.nom,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="color: black; padding: 5px;">
                <strong>#${etat.ordre_entree} - ${etat.nom}</strong><br>
                <small>Entrée le : ${new Date(etat.date_entree).toLocaleDateString('fr-FR')}</small><br>
                <p style="margin-top:5px; font-size: 12px;">${etat.description}</p>
              </div>
            `,
          });

          marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
        }
      });
    });
  }, [isReady, etats]);

  return (
    <div className="p-4 max-w-7xl mx-auto font-sans">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-black text-blue-900 flex items-center gap-3">
          🇺🇸 Ordre d'entrée des États de l'Union
        </h1>
        <p className="text-gray-600 mt-2">Chronologie de la ratification de la Constitution</p>
      </header>

      {/* --- Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
        className="mb-8 border-4 border-white shadow-2xl rounded-2xl bg-slate-100 overflow-hidden"
      >
        {!isReady && (
          <div className="flex items-center justify-center h-full">
            <p className="animate-pulse font-bold text-blue-600">Initialisation de la carte...</p>
          </div>
        )}
      </div>

      {/* --- Liste des États --- */}
      <h2 className="text-2xl font-bold mb-6 text-red-700">Palmarès Chronologique</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etats.map((etat, i) => (
          <div key={i} className="p-5 border-l-4 border-blue-600 bg-white shadow-lg rounded-r-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-3xl font-black text-slate-200">#{etat.ordre_entree}</span>
              <span className="text-xs font-bold uppercase p-1 bg-slate-100 text-slate-500 rounded">
                {etat.date_entree}
              </span>
            </div>
            <h3 className="text-xl font-bold text-blue-900 mt-2">{etat.nom}</h3>
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">
              {etat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}