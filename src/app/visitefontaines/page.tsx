// /src/app/visitefontaines/page.tsx - CARTE + ACCORDÉON DES DÉTAILS

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Variable pour la clé API Google Maps
const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Establishment {
    name: string;
    address: string;
    description: string;
    details: string; // Doit être présent pour l'accordéon
}

export default function VisiteFontainesPage() {
    // ----------------------------------------------------
    // 1. DÉCLARATIONS DES ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [isReady, setIsReady] = useState(false);
    
    // ÉTAT POUR L'ACCORDÉON : stocke l'ID (index + 1) de la fontaine sélectionnée
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null); 

    // Fonction pour basculer l'affichage des détails
    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ----------------------------------------------------
    // 2. CHARGEMENT DES DONNÉES (useEffect de fetch)
    // ----------------------------------------------------
    useEffect(() => {
        fetch("/api/visitefontaines")
            .then((res) => res.json())
            .then((data: Establishment[]) => setEstablishments(data))
            .catch(console.error);
    }, []);

    // ----------------------------------------------------
    // 3. INITIALISATION ET MARQUEURS DE LA CARTE
    // ----------------------------------------------------
    useEffect(() => {
        if (!isReady || !mapRef.current || establishments.length === 0) return;

        if (mapInstance.current) {
            return;
        }

        // Initialisation de la carte
        mapInstance.current = new google.maps.Map(mapRef.current, {
            zoom: 13, 
            center: { lat: 43.6047, lng: 1.4442 }, 
            scrollwheel: true,
            gestureHandling: "greedy",
        });

        const geocoder = new google.maps.Geocoder();
        const map = mapInstance.current;
        const infowindows: google.maps.InfoWindow[] = [];

        // Ajout des marqueurs
        establishments.forEach((est, i) => {
            const id = i + 1; // ID basé sur l'index (correspond à l'ID de l'accordéon)
            const labelNumber = est.name.split('.')[0]; 

            setTimeout(() => {
                geocoder.geocode({ address: est.address + ", Toulouse" }, (results, status) => {
                    
                    if (status !== "OK" || !results?.[0]) {
                        console.error(`Erreur de géocodage pour ${est.name} (Statut: ${status}).`);
                        return;
                    }

                    const marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        label: labelNumber, 
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#FF6600",
                            fillOpacity: 1,
                            strokeWeight: 1.5,
                            strokeColor: "black",
                        },
                    });

                    // MODIFICATION IMPORTANTE : Ajout du listener pour l'accordéon au clic sur le marqueur
                    marker.addListener("click", () => {
                        // Bascule l'accordéon
                        toggleDetails(id);
                        
                        // Centre la carte et fait défiler la page vers l'élément de la liste
                        map.setCenter(marker.getPosition() as google.maps.LatLng);
                        document.getElementById(`fontaine-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                        // Logique de l'InfoWindow
                        infowindows.forEach(iw => iw.close());
                        infowindow.open(map, marker);
                    });

                    // Infowindow (simple affichage d'informations)
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

                });
            }, i * 300);
        });
    }, [isReady, establishments]);


    // ----------------------------------------------------
    // 4. RENDU JSX
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto">

      <nav className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour à l'accueil
        </Link>
      </nav>

            {/* Script de chargement de Google Maps */}
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

            {/* Conteneur de la Carte */}
            <div
                ref={mapRef}
                style={{ height: "70vh", width: "100%" }}
                className="mb-8 border rounded-lg bg-gray-100 flex items-center justify-center shadow-xl"
            >
                {!isReady && <p className="text-xl text-gray-500">Chargement de la carte…</p>}
            </div>

            {/* Liste des Fontaines avec Accordéon */}
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                Liste détaillée des fontaines (Cliquez sur l'élément ou le marqueur)
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishments.map((est, i) => {
                    const id = i + 1; // L'ID pour l'accordéon
                    const isDetailsOpen = openDetailsId === id; // Vérifie si l'accordéon doit être ouvert

                    return (
                        <li 
                            key={i} 
                            id={`fontaine-item-${id}`} // ID pour le défilement
                            className="p-4 border rounded bg-white shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => toggleDetails(id)} // Clic bascule l'affichage
                        >
                            <p className="text-lg font-bold flex justify-between items-center text-red-700">
                                <span>{est.name}</span>
                                {/* Indicateur de déploiement */}
                                <span className={`text-xl transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </p>
                            <p className="text-sm">{est.address}</p>
                            <p className="text-sm text-gray-600 italic mt-1">{est.description}</p>
                            
                            {/* NOUVEAU: Zone de description détaillée (Déploiement) */}
                            {isDetailsOpen && est.details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-800 transition-all duration-500 overflow-hidden">
                                    <h4 className="font-semibold mb-2 text-red-700">Détails Historiques et Artistiques:</h4>
                                    <div 
                                        className="prose max-w-none text-sm leading-relaxed" 
                                        dangerouslySetInnerHTML={{ 
                                            __html: est.details.replace(/\n/g, '<br/>') 
                                        }}
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
