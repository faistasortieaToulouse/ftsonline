// /src/app/ecrivainsaude/page.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// 💡 IMPORTER DIRECTEMENT LES DONNÉES DU FICHIER ROUTE.TS 
// (Ceci résout l'erreur ECONNREFUSED pendant le build)
import { ecrivainsData, Ecrivain } from '@/app/api/ecrivainsaude/route'; 
// Ajustez le chemin d'import si nécessaire (ex: '../../../app/api/ecrivainsaude/route')


export default function EcrivainsAudePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [markersCount, setMarkersCount] = useState(0);

  // Les données sont chargées statiquement via l'importation directe
  const establishments = ecrivainsData;

  useEffect(() => {
    if (!isReady || !mapRef.current || establishments.length === 0) return;

    // --- INITIALISATION DE LA CARTE ---
    const centerLatLng = { lat: 43.15, lng: 2.3 }; // Centre de l'Aude (Carcassonne/Narbonne)
    
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 9,
      center: centerLatLng,
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();
    let count = 0; // Compteur pour le label
    let markersPlaced = 0; // Compteur des marqueurs placés

    // --- PLACEMENT DES MARQUEURS ---
    establishments.forEach((ecrivain) => {
      // Utilisez la commune complète (Nom, Département) pour le géocodage
      const address = ecrivain.commune; 
      
      geocoder.geocode({ address: address, region: 'fr' }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          count++;
          
          const marker = new google.maps.Marker({
            map: mapInstance.current!,
            position: results[0].geometry.location,
            label: `${count}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#007BFF", // Bleu pour les écrivains
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#333333",
            },
            title: ecrivain.nom,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: Arial, sans-serif;">
                <strong>${count}. ${ecrivain.nom}</strong>
                <p>Né à : ${ecrivain.commune}</p>
                <p>Dates : ${ecrivain.dates || 'N/A'}</p>
                <p>Profession : ${ecrivain.description || 'Écrivain'}</p>
              </div>
            `,
          });

          marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
          
          markersPlaced++;
          setMarkersCount(markersPlaced);

        } else if (status === "ZERO_RESULTS") {
            // console.warn(`Géocodage échoué pour: ${address} - ZERO_RESULTS`);
        } else {
            // console.error(`Géocodage échoué pour: ${address} - Status: ${status}`);
        }
      });
    });

  }, [isReady, establishments]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* ⚠️ Assurez-vous d'avoir bien défini NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans votre environnement Vercel */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">🖋️ Écrivains de l'Aude sur la carte</h1>

      <div className="flex items-center gap-2 mb-4">
          <p className="font-semibold text-lg">
              {markersCount} lieux affichés sur {establishments.length} entrées.
          </p>
      </div>

      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {!isReady && <p>Chargement de l'API Google Maps…</p>}
        {isReady && markersCount === 0 && <p>Recherche des coordonnées…</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste Complète des Écrivains
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nom</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Commune</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Dates</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description / Profession</th>
          </tr>
        </thead>
        <tbody>
          {establishments.map((ecrivain, index) => (
            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.nom}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.commune}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.dates || 'N/A'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{ecrivain.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
