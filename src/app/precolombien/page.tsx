'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Types basés sur votre structure JSON
interface Civilisation {
  culture: string;
  periode: string;
  localisation: string;
  coordonnees: { lat: number; lon: number };
  description?: string;
}

interface DataStructure {
  civilisations_precolombiennes: {
    [region: string]: Civilisation[];
  };
}

export default function VisitePrecolombiennePage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  // Référence pour stocker les marqueurs et pouvoir interagir avec eux (centrage)
  const markersRef = useRef<{ [key: number]: google.maps.Marker }>({});

  const [data, setData] = useState<DataStructure | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 1. Charger les données (Liste aplatie pour garantir la numérotation)
  useEffect(() => {
    fetch("/api/precolombien")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error);
  }, []);

  // 2. Préparer la liste unique pour la numérotation 1, 2, 3...
  const civilisationsList = data 
    ? Object.values(data.civilisations_precolombiennes).flat() 
    : [];

  // 3. Carte et Marqueurs
  useEffect(() => {
    if (!isReady || !mapRef.current || civilisationsList.length === 0) return;

    // Initialisation de la carte
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 15, lng: -85 },
      scrollwheel: true,
      gestureHandling: "greedy",
      styles: [{ featureType: "poi", visibility: "off" }] // Masque les points d'intérêt inutiles
    });

    const infowindow = new google.maps.InfoWindow();

    civilisationsList.forEach((civ, i) => {
      const numero = i + 1;
      
      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: { lat: civ.coordonnees.lat, lng: civ.coordonnees.lon },
        label: {
          text: `${numero}`,
          color: "white",
          fontWeight: "bold",
          fontSize: "12px"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#78350f", // Couleur terre/antique
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "white",
        },
        title: civ.culture,
      });

      // Stocker le marqueur pour y accéder depuis la liste
      markersRef.current[numero] = marker;

      marker.addListener("click", () => {
        infowindow.setContent(`
          <div style="padding:5px; font-family: sans-serif;">
            <strong>${numero}. ${civ.culture}</strong><br>
            <small>${civ.periode}</small>
          </div>
        `);
        infowindow.open(mapInstance.current, marker);
        mapInstance.current?.panTo(marker.getPosition()!);
      });
    });
  }, [isReady, civilisationsList]);

  // Fonction pour centrer la carte quand on clique sur un item de la liste
  const handleFocusPlace = (numero: number) => {
    const marker = markersRef.current[numero];
    if (marker && mapInstance.current) {
      mapInstance.current.setZoom(8);
      mapInstance.current.panTo(marker.getPosition()!);
      google.maps.event.trigger(marker, 'click');
      // Scroll vers la carte pour voir le résultat (optionnel)
      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-[#fdfcf8] min-h-screen">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6 text-amber-900 border-b-4 border-amber-700 inline-block">
        🗺️ Carte des Civilisations Anciennes des Amériques
      </h1>

      {/* --- Conteneur Carte --- */}
      <div
        ref={mapRef}
        style={{ height: "65vh", width: "100%" }}
        className="mb-8 border-4 border-white rounded-xl shadow-2xl bg-gray-200"
      >
        {!isReady && <div className="flex items-center justify-center h-full italic">Chargement des données géographiques...</div>}
      </div>

      {/* --- Liste des Civilisations --- */}
      <h2 className="text-2xl font-bold mb-6 text-amber-800">
        Sites et Cultures ({civilisationsList.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {civilisationsList.map((civ, i) => {
          const numero = i + 1;
          return (
            <div 
              key={i} 
              onClick={() => handleFocusPlace(numero)}
              className="p-5 border border-amber-100 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                  {numero}
                </span>
                <h3 className="text-xl font-bold text-amber-900 group-hover:text-amber-600">
                  {civ.culture}
                </h3>
              </div>
              
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold text-amber-700">{civ.periode}</p>
                <p className="italic">📍 {civ.localisation}</p>
                {civ.description && <p className="mt-3 text-gray-600 line-clamp-3">{civ.description}</p>}
              </div>
              
              <div className="mt-4 text-[10px] font-mono text-gray-400 uppercase">
                {civ.coordonnees.lat.toFixed(4)} / {civ.coordonnees.lon.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}