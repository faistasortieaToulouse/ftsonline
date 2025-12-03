"use client";
import { useEffect, useRef, useState } from "react";

interface Library {
  name: string;
  address: string;
}

// ID UNIQUE pour le script Google Maps
const MAPS_SCRIPT_ID = 'google-maps-script-loader';

export default function BibliomapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let data: Library[] = [];
    
    // 1. Logique d'initialisation de la carte et des marqueurs (appelée par Google Maps)
    const initMapLogic = () => {
        setIsLoading(false);
        if (!mapRef.current || data.length === 0) return;

        // Le code d'initialisation de la carte est maintenant garanti d'avoir l'objet 'google'
        const map = new google.maps.Map(mapRef.current, {
            zoom: 12,
            center: { lat: 43.6045, lng: 1.444 }, 
        });

        // 4. Géocodage et ajout des marqueurs
        data.forEach((library: Library) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: library.address }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    // ⚠️ La dépréciation persiste, mais le code fonctionne.
                    const marker = new google.maps.Marker({
                        map,
                        position: results[0].geometry.location,
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: `<strong>${library.name}</strong><br>${library.address}`,
                    });

                    marker.addListener("click", () => {
                        infowindow.open(map, marker);
                    });
                    marker.addListener("mouseover", () => {
                        if (!("ontouchstart" in window)) infowindow.open(map, marker);
                    });
                    marker.addListener("mouseout", () => {
                        if (!("ontouchstart" in window)) infowindow.close();
                    });
                }
            });
        });
    };
    
    // 2. Définir la fonction de rappel globale (appelée par le script Google Maps)
    (window as any).initMap = initMapLogic;


    async function init() {
        // Vérifie si le script est DÉJÀ là pour éviter de le recharger
        if (document.getElementById(MAPS_SCRIPT_ID)) {
            // Si le script est là, on essaie d'appeler la logique de la carte immédiatement
            initMapLogic(); 
            return;
        }
        
        // Récupération des données AVANT de charger le script
        try {
            const res = await fetch("/api/bibliomap"); 
            if (res.ok) {
                data = await res.json();
                setLibraries(data);
            } else {
                console.error(`Erreur HTTP: ${res.status}`);
            }
        } catch (error) {
            console.error("Erreur de chargement des bibliothèques (API):", error);
        }

        // 3. Création et Chargement du script Google Maps
        const mapScript = document.createElement("script");
        mapScript.id = MAPS_SCRIPT_ID;
        
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        mapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=initMap&libraries=places`; 
        mapScript.async = true;

        mapScript.onerror = () => {
            setIsLoading(false);
            console.error("Erreur lors du chargement du script Google Maps.");
        };

        document.body.appendChild(mapScript);
    }

    init();
    
    // 🛑 ATTENTION : Suppression de la fonction de nettoyage (return () => { ... })
    // Cela empêche l'erreur DOMException: Node.removeChild.
    // Le script reste dans le DOM, ce qui est acceptable pour un script global unique.
    
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
