"use client";
import { useEffect, useRef, useState } from "react";

// Définition du type pour assurer la cohérence des données
interface Library {
  name: string;
  address: string;
}

export default function BibliomapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Variable pour stocker la référence au script Google Maps
    let script: HTMLScriptElement | null = null;
    
    async function init() {
      // 1. Récupération des données depuis l'API interne
      let data: Library[] = [];
      try {
        // 💡 CORRECTION 1: Utilisation de /api/bibliomap pour la route API
        const res = await fetch("/api/bibliomap"); 
        
        if (!res.ok) {
            // Si la réponse n'est pas OK, lever une erreur mais ne pas crash
            console.error(`Erreur HTTP: ${res.status} lors du fetch de l'API /api/bibliomap`);
            throw new Error("Erreur de récupération des données des bibliothèques.");
        }
        
        data = await res.json();
        setLibraries(data);
      } catch (error) {
        console.error("Erreur de chargement des bibliothèques (API):", error);
      }

      // 2. Chargement du script Google Maps
      script = document.createElement("script");
      
      // 💡 CORRECTION 2 & 3: Utilisation de process.env SANS window. et ajout de loading=async
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
      script.async = true;

      script.onload = () => {
        setIsLoading(false);
        if (!mapRef.current) return;

        // 3. Initialisation de la carte
        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 43.6045, lng: 1.444 }, // Centré sur Toulouse
        });

        // 4. Géocodage et ajout des marqueurs
        data.forEach((library: Library) => {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: library.address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
              });

              const infowindow = new google.maps.InfoWindow({
                content: `<strong>${library.name}</strong><br>${library.address}`,
              });

              // Gestion des événements de la souris et du clic pour l'infowindow
              marker.addListener("mouseover", () => {
                if (!("ontouchstart" in window)) infowindow.open(map, marker);
              });

              marker.addListener("mouseout", () => {
                if (!("ontouchstart" in window)) infowindow.close();
              });

              marker.addListener("click", () => {
                infowindow.open(map, marker);
              });
            }
          });
        });
      };
      
      script.onerror = () => {
        setIsLoading(false);
        console.error("Erreur lors du chargement du script Google Maps. Vérifiez la clé API.");
      };

      document.body.appendChild(script);
    }

    init();
    
    // Nettoyage : retirer le script si le composant est démonté
    return () => {
        // 💡 CORRECTION 3: Vérification si le script existe et est toujours un enfant du body avant de le retirer
        if (script && document.body.contains(script)) {
            document.body.removeChild(script);
        }
    };
  }, []);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">📍 Carte des Bibliothèques de Toulouse</h1>
      
      {/* Affichage de la carte */}
      <div 
        ref={mapRef} 
        style={{ height: '70vh', width: '100%' }}
        className="mb-8 border border-gray-300 rounded-lg shadow-xl bg-gray-100 flex items-center justify-center text-gray-500"
      >
        {isLoading && (
            <p>Chargement de la carte et des données...</p>
        )}
      </div>

      <hr className="my-8 border-gray-200" />

      {/* Liste des bibliothèques */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liste Complète des Établissements ({libraries.length})</h2>
      
      {libraries.length === 0 && !isLoading ? (
        <p className="text-red-500">Aucune bibliothèque trouvée ou erreur de chargement des données.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {libraries.map((library, index) => (
            <li 
              key={index} 
              className="p-4 border border-indigo-100 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-lg font-bold text-indigo-700">{library.name}</p>
              <p className="text-sm text-gray-600 mt-1">{library.address}</p>
            </li>
          ))}
        </ul>
      )}
      
    </div>
  );
}
