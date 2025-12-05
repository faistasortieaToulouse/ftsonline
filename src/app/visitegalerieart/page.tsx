"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Variable pour la clé API Google Maps (assurez-vous qu'elle est définie dans votre environnement)
const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Interface pour la structure des données des galeries
interface Gallery {
    name: string;
    address: string;
    url: string;
}

export default function VisiteGalerieArtPage() {
    // ----------------------------------------------------
    // 1. DÉCLARATIONS DES ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [isReady, setIsReady] = useState(false);
    
    // ÉTAT POUR L'ACCORDÉON : stocke l'ID (index) de la galerie sélectionnée
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null); 

    // Fonction pour basculer l'affichage de l'URL
    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ----------------------------------------------------
    // 2. CHARGEMENT DES DONNÉES (useEffect de fetch)
    // ----------------------------------------------------
    useEffect(() => {
        // Chemin relatif vers l'API interne
        fetch("/api/visitegalerieart")
            .then((res) => res.json())
            .then((data: Gallery[]) => setGalleries(data))
            .catch(console.error);
    }, []);

    // ----------------------------------------------------
    // 3. INITIALISATION ET MARQUEURS DE LA CARTE
    // ----------------------------------------------------
    useEffect(() => {
        if (!isReady || !mapRef.current || galleries.length === 0) return;

        // Empêche la réinitialisation de la carte
        if (mapInstance.current) {
            return;
        }

        // Initialisation de la carte (centrée sur Toulouse)
        mapInstance.current = new google.maps.Map(mapRef.current, {
            zoom: 13, 
            center: { lat: 43.6047, lng: 1.4442 }, 
            scrollwheel: true,
            gestureHandling: "greedy",
        });

        const geocoder = new google.maps.Geocoder();
        const map = mapInstance.current;
        const infowindows: google.maps.InfoWindow[] = [];

        // Ajout des marqueurs pour chaque galerie
        galleries.forEach((gallery, i) => {
            const id = i; // L'ID correspond à l'index du tableau
            // Le numéro affiché commence à 1
            const markerNumber = (i + 1).toString(); 
            const addressWithCity = gallery.address.includes('Toulouse') ? gallery.address : `${gallery.address}, Toulouse`;

            // Utilise un setTimeout pour espacer les requêtes de géocodage et éviter les limites
            setTimeout(() => {
                geocoder.geocode({ address: addressWithCity }, (results, status) => {
                    
                    if (status !== "OK" || !results?.[0]) {
                        console.warn(`Avertissement de géocodage pour ${gallery.name} (Statut: ${status}). L'adresse n'a peut-être pas été trouvée.`);
                        return;
                    }
                    
                    // Crée l'icône personnalisée avec le numéro DANS UN CERCLE
                    const numberedIcon: google.maps.MarkerOptions['icon'] = {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12, // Taille du cercle de fond pour contenir le numéro
                        fillColor: "#007BFF", // Couleur du cercle (bleu)
                        fillOpacity: 1, 
                        strokeWeight: 0, // Pas de bordure
                        labelOrigin: new google.maps.Point(0, 0), // Centre le label
                    };

                    const marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        icon: numberedIcon, // Utilisation de l'icône avec le cercle coloré
                        label: {
                            text: markerNumber,
                            color: "#FFFFFF", // Couleur du texte (blanc)
                            fontWeight: "bold",
                            fontSize: "12px",
                        },
                        title: `${markerNumber}. ${gallery.name}`,
                    });

                    // Infowindow (simple affichage d'informations)
                    const infowindow = new google.maps.InfoWindow({
                        content: `
                            <div style="font-family: Arial, sans-serif; max-width: 200px;">
                                <strong style="color: #007BFF;">${markerNumber}. ${gallery.name}</strong>
                                <br><small>${gallery.address}</small>
                            </div>
                        `,
                    });
                    
                    infowindows.push(infowindow);

                    // Au clic sur le marqueur
                    marker.addListener("click", () => {
                        // Bascule l'accordéon correspondant
                        toggleDetails(id);
                        
                        // Centre la carte sur le marqueur
                        map.setCenter(marker.getPosition() as google.maps.LatLng);
                        
                        // Ouvre l'infowindow
                        infowindows.forEach(iw => iw.close());
                        infowindow.open(map, marker);
                        
                        // Fait défiler la page vers l'élément de la liste
                        document.getElementById(`gallery-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });

                });
            }, i * 200); // Délai réduit à 200ms pour accélérer le chargement initial
        });
    }, [isReady, galleries]);


    // ----------------------------------------------------
    // 4. RENDU JSX
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Script de chargement de Google Maps */}
            {GMAPS_API_KEY && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places`}
                    strategy="afterInteractive"
                    onLoad={() => setIsReady(true)}
                />
            )}

            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800">
                🎨 Visite des Galeries d'Art à Toulouse — ({galleries.length} Lieux)
            </h1>

            {/* Conteneur de la Carte */}
            <div
                ref={mapRef}
                style={{ height: "60vh", width: "100%" }}
                className="mb-8 border-4 border-blue-200 rounded-xl bg-gray-50 flex items-center justify-center shadow-2xl"
            >
                {!isReady && <p className="text-xl text-gray-500">Chargement de la carte et géocodage des adresses...</p>}
            </div>

            {/* Liste des Galeries avec Accordéon */}
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-blue-700">
                Liste détaillée (Cliquez sur l'élément ou le marqueur)
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery, i) => {
                    const id = i; // L'ID pour l'accordéon (index)
                    const isDetailsOpen = openDetailsId === id; // Vérifie si l'accordéon doit être ouvert

                    return (
                        <li 
                            key={id} 
                            id={`gallery-item-${id}`} // ID pour le défilement
                            className="p-5 border-2 border-gray-100 rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex"
                            onClick={() => toggleDetails(id)} // Clic bascule l'affichage
                        >
                            <span className="text-2xl font-extrabold text-blue-500 mr-4 flex-shrink-0">
                                {i + 1}.
                            </span>
                            <div className="flex-grow">
                                <p className="text-lg font-bold flex justify-between items-center text-blue-900">
                                    <span>{gallery.name}</span>
                                    {/* Indicateur de déploiement */}
                                    <span className={`text-xl transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        ▼
                                    </span>
                                </p>
                                <p className="text-sm mt-1 text-gray-600">
                                    <span className="font-semibold">Adresse:</span> {gallery.address}
                                </p>
                                
                                {/* Zone de l'URL (Déploiement) */}
                                {isDetailsOpen && (
                                    <div className="mt-3 pt-3 border-t border-blue-100 transition-all duration-500 overflow-hidden">
                                        <h4 className="font-semibold mb-1 text-blue-700">Lien vers le site web:</h4>
                                        <a 
                                            href={gallery.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 underline text-sm break-all"
                                            // Empêche la fermeture de l'accordéon si on clique sur le lien
                                            onClick={(e) => e.stopPropagation()} 
                                        >
                                            {gallery.url}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
