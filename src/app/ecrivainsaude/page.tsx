// /src/app/ecrivainsaude/page.tsx

"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// 💡 IMPORTEZ DIRECTEMENT LES DONNÉES DU FICHIER ROUTE.TS 
import { ecrivainsData, Ecrivain } from '@/app/api/ecrivainsaude/route'; 

// Définir le type pour le marqueur avancé pour la liste de nettoyage
type AdvancedMarker = google.maps.marker.AdvancedMarkerElement;

export default function EcrivainsAudePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [markersCount, setMarkersCount] = useState(0);

  const establishments = ecrivainsData;

  useEffect(() => {
    // 1. Vérifications initiales
    if (!isReady || !mapRef.current) return;
    
    // 2. Empêcher la réinitialisation de la carte. L'effet doit s'exécuter UNE SEULE FOIS.
    if (mapInstance.current) return; 

    const centerLatLng = { lat: 43.15, lng: 2.3 }; 
    
    // --- INITIALISATION DE LA CARTE ---
    const newMap = new google.maps.Map(mapRef.current, {
      zoom: 9,
      center: centerLatLng,
      scrollwheel: true,
      gestureHandling: "greedy",
      // CRITIQUE : Map ID est requis pour les Advanced Markers
      mapId: "DEMO_MAP_ID", 
    });
    mapInstance.current = newMap;


    const geocoder = new google.maps.Geocoder();
    let count = 0;
    let markersPlaced = 0;
    const allMarkers: AdvancedMarker[] = []; // Liste pour le nettoyage

    // --- PLACEMENT DES MARQUEURS ---
    establishments.forEach((ecrivain) => {
      const address = ecrivain.commune; 
      
      geocoder.geocode({ address: address, region: 'fr' }, (results, status) => {
        if (status === "OK" && results?.[0] && mapInstance.current) {
          count++;
          
          // Création du DOM personnalisé pour le marqueur numéroté
          const markerContent = document.createElement("div");
          markerContent.className = "marker-pin";
          markerContent.style.cssText = `
            width: 25px;
            height: 25px;
            background-color: #007BFF;
            border: 2px solid #333333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            cursor: pointer;
          `;
          markerContent.textContent = `${count}`;

          // CRITIQUE : Utilisation de google.maps.marker.AdvancedMarkerElement
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstance.current, 
            position: results[0].geometry.location,
            title: ecrivain.nom,
            content: markerContent, 
          });

          allMarkers.push(marker); // Ajouter le marqueur à la liste

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

          marker.addListener("click", () => infowindow.open({
            anchor: marker,
            map: mapInstance.current!,
          }));
          
          markersPlaced++;
          setMarkersCount(markersPlaced);
        }
      });
    });

    // CRITIQUE : Fonction de nettoyage pour retirer les marqueurs avant le re-rendu/démontage
    return () => {
        allMarkers.forEach(marker => marker.map = null); 
        mapInstance.current = null;
    };

  }, [isReady]); // Dépendance uniquement sur isReady

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* CRITIQUE : Ajout de la bibliothèque 'marker' */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker`}
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
