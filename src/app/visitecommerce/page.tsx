'use client';

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Interface basée sur la structure des données de votre API /api/visitecommerce
interface CommercePlace {
  nomLieu: string;
  num: string; // Numéro de la rue
  typeRue: string; // "rue", "place", "quai", etc.
  nomRue: string; // Nom de la voie
  quartier: string;
  établissement: string; // Type de commerce/lieu
  commentaire: string; // Commentaire/Description (e.g., "ancien", "persan", "Galerie")
}

export default function CommercePlacesPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [places, setPlaces] = useState<CommercePlace[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Récupération des données de l'API ---
  useEffect(() => {
    fetch("/api/visitecommerce")
      .then(async (res) => {
        const text = await res.text();
        try {
          const data: CommercePlace[] = JSON.parse(text);
          setPlaces(data);
        } catch (err) {
          console.error("Erreur JSON /api/visitecommerce :", text, err);
          setError("Erreur lors de la lecture des données de l'API.");
        }
      })
      .catch((err) => {
        console.error("Erreur Fetch /api/visitecommerce :", err);
        setError("Erreur de connexion à l'API des commerces.");
      });
  }, []);

  // --- 2. Initialisation de la carte et des marqueurs ---
  useEffect(() => {
    // S'assurer que le script Maps est chargé, le conteneur existe et les données sont disponibles
    if (!isReady || !mapRef.current || places.length === 0) return;

    if (error) return; // Ne pas continuer s'il y a une erreur

    // Initialisation de la carte, centrée sur Toulouse
    mapInstance.current = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: { lat: 43.6045, lng: 1.444 }, // Centre de Toulouse
      scrollwheel: true,
      gestureHandling: "greedy",
    });

    const geocoder = new google.maps.Geocoder();

    places.forEach((place, i) => {
      if (!place.nomRue) return;

      // Construction de l'adresse complète pour le géocodage
      const numero = place.num && place.num !== "0" ? `${place.num} ` : "";
      const adresse = `Toulouse, ${numero}${place.typeRue} ${place.nomRue}`;

      // Utilisation de setTimeout pour espacer les requêtes de géocodage 
      // et éviter de dépasser les limites de l'API (200ms par requête ici)
      setTimeout(() => {
        geocoder.geocode({ address: adresse }, (results, status) => {
          if (status !== "OK" || !results?.[0]) {
            console.warn(`Adresse non trouvée pour le commerce: "${adresse}" — status: ${status}`);
            return;
          }

          const marker = new google.maps.Marker({
            map: mapInstance.current!,
            position: results[0].geometry.location,
            label: `${i + 1}`, // Numéroter les marqueurs
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8, // Taille plus petite pour les commerces
              fillColor: "#007bff", // Couleur bleue pour distinguer
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#000000",
            },
            title: place.nomLieu,
          });

          // Contenu de la fenêtre d'information
          const infowindow = new google.maps.InfoWindow({
            content: `
              <strong>${i + 1}. ${place.nomLieu}</strong><br>
              ${numero}${place.typeRue} ${place.nomRue}<br>
              Quartier : ${place.quartier}<br>
              Type : ${place.établissement}<br>
              Commentaire : ${place.commentaire || "N/A"}
            `,
          });

          marker.addListener("click", () => infowindow.open(mapInstance.current, marker));
        });
      }, i * 250); // Délai de 250ms entre chaque requête
    });

  }, [isReady, places, error]);


  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

      {/* Chargement asynchrone du script Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&async=1`}
        strategy="afterInteractive"
        onLoad={() => setIsReady(true)}
      />

      <h1 className="text-3xl font-extrabold mb-6">
        🛍️ Visite des Commerces et Lieux Historiques
      </h1>

      {/* Conteneur de la carte */}
      <div
        ref={mapRef}
        style={{ height: "70vh", width: "100%" }}
        className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
      >
        {error && <p className="text-red-600">Erreur : {error}</p>}
        {!isReady && !error && <p>Chargement de la carte…</p>}
        {isReady && !error && places.length === 0 && <p>Données des commerces en cours de chargement...</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Liste des Commerces ({places.length})
      </h2>

      {/* Liste des lieux en bas de page */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {places.map((place, i) => (
          <li key={i} className="p-4 border rounded bg-white shadow">
            <p className="text-lg font-bold">{i + 1}. {place.nomLieu}</p>
            <p className="italic">{place.num} {place.typeRue} {place.nomRue} — {place.quartier}</p>
            <p>Type : {place.établissement}</p>
            {place.commentaire && <p>Commentaire : {place.commentaire}</p>}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center font-semibold text-gray-500">
        Informations géolocalisées via Google Maps.
      </p>
    </div>
  );
}
