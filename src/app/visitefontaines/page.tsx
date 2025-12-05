// /src/app/visitefontaines/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// On utilise le même type d'interface pour la compatibilité
interface Establishment {
    name: string;
    address: string;
    description: string;
}

export default function VisiteFontainesPage() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // 1. Récupération des données des fontaines via la nouvelle API
        fetch("/api/visitefontaines")
            .then((res) => res.json())
            .then((data: Establishment[]) => setEstablishments(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!isReady || !mapRef.current) return;

        if (mapInstance.current) {
            // Si la carte existe déjà (pour éviter de la recharger lors d'un hot-reload)
            return;
        }

        // 2. Initialisation de la carte Google Maps
        mapInstance.current = new google.maps.Map(mapRef.current, {
            zoom: 13, // Zoom ajusté pour couvrir un plus grand périmètre (Toulouse)
            center: { lat: 43.6047, lng: 1.4442 }, // Centre de Toulouse
            scrollwheel: true,
            gestureHandling: "greedy",
        });

        const geocoder = new google.maps.Geocoder();
        const map = mapInstance.current;

        // 3. Ajout des marqueurs pour chaque fontaine
        establishments.forEach((est, i) => {
            const labelNumber = est.name.split('.')[0]; // Récupère le numéro de l'ID

            // Géocodage de l'adresse de la fontaine
            geocoder.geocode({ address: est.address }, (results, status) => {
                if (status !== "OK" || !results?.[0]) {
                    console.error(`Erreur de géocodage pour ${est.name}: ${status}`);
                    return;
                }

                const marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    label: labelNumber, // Utilise le numéro d'ID comme étiquette
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#FF6600", // Couleur différente (Orange/Toulouse)
                        fillOpacity: 1,
                        strokeWeight: 1.5,
                        strokeColor: "black",
                    },
                });

                // Contenu de la fenêtre d'information
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

                marker.addListener("click", () => infowindow.open(map, marker));
            });
        });
    }, [isReady, establishments]);


    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Le script de Google Maps. Assurez-vous que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY est défini dans votre .env */}
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                strategy="afterInteractive"
                onLoad={() => setIsReady(true)}
            />

            <h1 className="text-3xl font-extrabold mb-6">
                ⛲ Visite des Fontaines de Toulouse — (${establishments.length} Lieux)
            </h1>

            <div
                ref={mapRef}
                style={{ height: "70vh", width: "100%" }}
                className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center"
            >
                {!isReady && <p>Chargement de la carte…</p>}
            </div>

            <h2 className="text-2xl font-semibold mb-4">
                Liste des fontaines ({establishments.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishments.map((est, i) => (
                    <li key={i} className="p-4 border rounded bg-white shadow">
                        <p className="text-lg font-bold">
                            {est.name}
                        </p>
                        <p>{est.address}</p>
                        <p className="text-sm text-gray-600 italic mt-1">{est.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
