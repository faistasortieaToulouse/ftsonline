// src/app/visitejolimont/page.tsx - CARTE AVEC GEOCODER (SANS COORDONNÉES PRÉ-DÉFINIES)

'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Assurez-vous d'avoir une clé Google Maps configurée dans votre .env.local
const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Interface adaptée à la structure de données de src/app/api/visitejolimont/route.ts
// L'interface n'inclut plus 'lat' et 'lng'
interface JolimontPlace {
  nomLieu: string;
  num: string | number;
  typeRue: string;
  nomRue: string;
  appartient: string;
  site: string;
  quartier: string;
  établissement: string;
  sigles: string;
  signification: string;
}

export default function VisiteJolimontPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  const [places, setPlaces] = useState<JolimontPlace[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- 1. Charger les données (visitejolimont) ---
  useEffect(() => {
    fetch("/api/visitejolimont")
      .then(async (res) => {
        const text = await res.text();
        try {
          const data: JolimontPlace[] = JSON.parse(text);
          setPlaces(data);
        } catch (err) {
          console.error("❌ Erreur JSON /api/visitejolimont :", text, err);
        }
      })
      .catch(console.error);
  }, []);

  // --- 2. Carte Google Maps (Utilisation du Geocoder) ---
  useEffect(() => {
    if (!isReady || !mapRef.current || places.length === 0 || mapInstance.current) return;

    // 1. Initialisation de la carte (Centrée sur la zone Jolimont/colline Est)
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.6075, lng: 1.4650 }, // Centre sur Jolimont, en attendant la première adresse
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();
    const map = mapInstance.current;
    
    // 2. Traitement des adresses via Geocoder
    places.forEach((place, i) => {
      // Délais pour gérer les quotas d'API Geocoding (max 10 requêtes par seconde)
      setTimeout(() => {
        const id = i + 1;
        const numero = place.num && place.num !== "0" ? `${place.num} ` : "";
        
        // Construction de l'adresse complète pour le geocoder
        const adresse = `${numero}${place.typeRue} ${place.nomRue}, 31500 Toulouse`; 

        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            console.warn(`⚠ Adresse introuvable: "${adresse}" — status: ${status}`);
            return;
          }

          // Le Geocoder retourne la position, que l'on utilise pour le marqueur
          const position = results[0].geometry.location;

          const marker = new google.maps.Marker({
            map: map,
            position: position,
            label: `${id}`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#007BFF", 
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: "black",
            },
            title: place.nomLieu,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 250px;">
                  <strong>${id}. ${place.nomLieu}</strong><br>
                  <small>${adresse}</small><hr style="margin: 4px 0;">
                  <p style="margin: 0; font-size: 13px;">**Quartier** : ${place.quartier}</p>
                  <p style="margin: 0; font-size: 13px;">**Établissement** : ${place.établissement}</p>
                  <p style="margin: 0; font-size: 13px; font-style: italic;">${place.signification}</p>
              </div>
            `,
          });

          marker.addListener("click", () => infowindow.open(map, marker));
        });
      }, i * 200); // 200 ms de délai entre chaque requête de geocoding
    });
  }, [isReady, places]);

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* --- Script Google Maps --- */}
      {GMAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&async=1&libraries=places`}
          strategy="afterInteractive"
          onLoad={() => setIsReady(true)}
        />
      )}

      <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800">
        🗺️ Circuit Historique de Jolimont — ({places.length} Lieux)
      </h1>

      {/* --- Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border-4 border-blue-200 rounded-lg bg-gray-100 flex items-center justify-center shadow-xl"
      >
        {!isReady && <p className="text-xl text-gray-500">Chargement de la carte…</p>}
      </div>

      {/* --- Liste des lieux --- */}
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
        Liste des lieux détaillés ({places.length})
      </h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => {
          const numero = place.num && place.num !== "0" ? `${place.num} ` : "";
          const adresseComplete = `${numero}${place.typeRue} ${place.nomRue}`;

          return (
            <li 
                key={i} 
                className="p-4 border rounded bg-white shadow hover:shadow-lg transition-all"
            >
              <p className="text-lg font-bold text-blue-700">
                {i + 1}. {place.nomLieu}
              </p>
              <p className="text-sm italic text-gray-600">
                {adresseComplete} ({place.quartier})
              </p>
              <p className="mt-2 text-sm">
                **Type** : {place.établissement}
              </p>
              {place.signification && (
                <p className="text-sm">
                  **Détail** : {place.signification}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}