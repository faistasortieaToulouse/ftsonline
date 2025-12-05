// /src/app/visitefontaines/page.tsx - RESTAURATION DE LA CARTE ORIGINALE + CORRECTIONS

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Variable pour la clé API Google Maps (utilise celle que vous aviez définie dans votre script)
const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Establishment {
    name: string;
    address: string;
    description: string;
    // Ajouté ce champ manquant pour être cohérent avec votre API de fontaines
    details: string; 
}

export default function VisiteFontainesPage() {
    // Déclarations des états et références (OBLIGATOIRE pour éviter ReferenceError)
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [isReady, setIsReady] = useState(false);

    // ----------------------------------------------------
    // 1. CHARGEMENT DES DONNÉES (useEffect de fetch)
    // ----------------------------------------------------
    useEffect(() => {
        // 1. Récupération des données des fontaines via l'API
        fetch("/api/visitefontaines")
            .then((res) => res.json())
            .then((data: Establishment[]) => setEstablishments(data))
            .catch(console.error);
    }, []);

    // ----------------------------------------------------
    // 2. INITIALISATION ET MARQUEURS DE LA CARTE
    // ----------------------------------------------------
    useEffect(() => {
        if (!isReady || !mapRef.current || establishments.length === 0) return;

        // Empêche la double initialisation de la carte
        if (mapInstance.current) {
            return;
        }

        // Initialisation de la carte Google Maps (Vos paramètres originaux)
        mapInstance.current = new google.maps.Map(mapRef.current, {
            zoom: 13, 
            center: { lat: 43.6047, lng: 1.4442 }, // Centre de Toulouse
            scrollwheel: true,
            gestureHandling: "greedy",
        });

        const geocoder = new google.maps.Geocoder();
        const map = mapInstance.current;
        const infowindows: google.maps.InfoWindow[] = [];

        // 3. Ajout des marqueurs avec un délai pour le Geocoder
        establishments.forEach((est, i) => {
            const labelNumber = est.name.split('.')[0]; 

            // Délai de 300ms entre les requêtes de géocodage pour éviter les erreurs de quota/vitesse
            setTimeout(() => {
                // IMPORTANT: Ajout de ", Toulouse" pour aider la précision du géocodage
                geocoder.geocode({ address: est.address + ", Toulouse" }, (results, status) => {
                    
                    if (status !== "OK" || !results?.[0]) {
                        console.error(`Erreur de géocodage pour ${est.name} (Statut: ${status}). Adresse essayée: ${est.address}`);
                        return;
                    }

                    const marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        label: labelNumber, 
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#FF6600", // Orange/Toulouse
                            fillOpacity: 1,
                            strokeWeight: 1.5,
                            strokeColor: "black",
                        },
                    });

                    // Création de l'InfoWindow
                    const infowindow = new google.maps.InfoWindow({
                        content: `
                            <div style="font-family: Arial, sans-serif;">
                                <strong>${est.name.replace(`${labelNumber}. `, '')} (${labelNumber})</strong>
                                <br><small>${est.address}</small>
                                <hr style="margin: 5px 0;">
                                <p style="margin: 0;">${est.description}</p>
                            </div>
                        `,
                    });
                    
                    infowindows.push(infowindow);

                    // Ajout de l'événement clic
                    marker.addListener("click", () => {
                        // Ferme toutes les infowindows avant d'ouvrir la nouvelle
                        infowindows.forEach(iw => iw.close()); 
                        infowindow.open(map, marker);
                    });
                });
            }, i * 300); // Délai de 300 ms entre chaque appel
        });
    }, [isReady, establishments]);


    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* ----------------- Script de chargement de Google Maps ----------------- */}
            {GMAPS_API_KEY && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places`}
                    strategy="afterInteractive"
                    onLoad={() => setIsReady(true)}
                />
            )}

            <h1 className="text-3xl font-extrabold mb-6 text-center">
                ⛲ Visite des Fontaines de Toulouse — ({establishments.length} Lieux)
            </h1>

            {/* ----------------- Conteneur de la Carte ----------------- */}
            <div
                ref={mapRef}
                style={{ height: "70vh", width: "100%" }}
                className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center shadow-xl"
            >
                {!isReady && <p className="text-xl text-gray-500">Chargement de la carte…</p>}
            </div>

            {/* ----------------- Liste des Fontaines ----------------- */}
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                Liste des fontaines ({establishments.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishments.map((est, i) => (
                    <li key={i} className="p-4 border rounded bg-white shadow hover:shadow-md transition-shadow">
                        <p className="text-lg font-bold text-red-700">
                            {est.name}
                        </p>
                        <p className="text-sm">{est.address}</p>
                        <p className="text-sm text-gray-600 italic mt-1">{est.description}</p>
                        {/* Note: Le détail est dans l'API, mais non affiché dans la liste ici (selon votre version simple) */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
