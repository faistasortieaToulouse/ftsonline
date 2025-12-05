// /src/app/visitefontaines/page.tsx - VERSION COMPLÈTE ET CORRIGÉE

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Assurez-vous d'avoir une variable d'environnement NEXT_PUBLIC_GMAPS_API_KEY configurée
const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GMAPS_API_KEY;

// Définition de l'interface des données de fontaine
interface Establishment {
    name: string;
    address: string;
    description: string;
    details: string; 
}

export default function VisiteFontainesPage() {
    // ----------------------------------------------------
    // 1. DÉCLARATIONS DES ÉTATS ET RÉFÉRENCES (CORRECTION DE LA ReferenceError)
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

    // Fonction pour basculer l'affichage des détails
    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ----------------------------------------------------
    // 2. CHARGEMENT DES DONNÉES (useEffect de fetch)
    // ----------------------------------------------------
    useEffect(() => {
        async function fetchEstablishments() {
            try {
                const res = await fetch('/api/visitefontaines');
                const data = await res.json();
                setEstablishments(data);
            } catch (error) {
                console.error("Erreur lors du chargement des fontaines:", error);
            }
        }
        fetchEstablishments();
    }, []);

    // ----------------------------------------------------
    // 3. INITIALISATION ET MARQUEURS DE LA CARTE
    // ----------------------------------------------------
    useEffect(() => {
        // Le code ne s'exécute que lorsque Google Maps est chargé (isReady)
        // et que nous avons des données à afficher.
        if (!isReady || !mapRef.current || establishments.length === 0) return;

        // Empêche de réinitialiser la carte à chaque re-rendu
        if (mapInstance.current) {
            return;
        }

        // ----------------- Initialisation de la carte -----------------
        const defaultCenter = { lat: 43.6047, lng: 1.4442 }; // Centre de Toulouse
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 13,
            minZoom: 12,
            mapId: "VISITE_FONTAINES", // Utilisez un Map ID personnalisé si configuré
        });
        const map = mapInstance.current;
        const geocoder = new google.maps.Geocoder();
        
        // ----------------- Placement des marqueurs -----------------
        establishments.forEach((est, i) => {
            // Utilisation d'un setTimeout pour éviter de saturer le Geocoder de Google Maps
            setTimeout(() => {
                geocoder.geocode({ address: est.address + ", Toulouse" }, (results, status) => {
                    if (status === "OK" && results && results[0]) {
                        const location = results[0].geometry.location;
                        const labelNumber = est.name.split('.')[0];
                        
                        const marker = new google.maps.Marker({
                            position: location,
                            map: map,
                            title: est.name,
                            label: labelNumber,
                            animation: google.maps.Animation.DROP,
                        });

                        // MODIFICATION : Au clic sur le marqueur, on déploie les détails
                        marker.addListener("click", () => {
                            // On trouve l'ID de la fontaine (assumons qu'il est dans le nom)
                            const id = parseInt(labelNumber);
                            if (!isNaN(id)) {
                                toggleDetails(id);
                                
                                // Fait défiler la page jusqu'à l'élément de la liste correspondant
                                document.getElementById(`fontaine-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        });
                        
                        // L'infowindow s'ouvre au survol (mouseover) ou au clic, selon votre préférence
                        const infowindow = new google.maps.InfoWindow({
                            content: `<strong>${est.name.split('. ').slice(1).join('. ')}</strong><br>${est.description}`,
                        });
                        
                        marker.addListener("mouseover", () => {
                            infowindow.open(map, marker);
                        });

                        marker.addListener("mouseout", () => {
                            infowindow.close();
                        });
                        
                    } else {
                        console.error("Geocode failed for: " + est.address + " Status: " + status);
                    }
                });
            }, i * 300); // Délai de 300ms entre chaque requête Geocoder
        });
    }, [isReady, establishments]); // Les dépendances s'assurent que le code est réexécuté lorsque ces états changent

    // ----------------------------------------------------
    // 4. RENDU JSX
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Script de chargement de Google Maps */}
            {GMAPS_API_KEY && (
                <Script
                    src={`https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&callback=initMap&v=weekly`}
                    onLoad={() => setIsReady(true)}
                    strategy="beforeInteractive"
                />
            )}

            <h1 className="text-3xl font-extrabold mb-6 text-center text-red-600">
                ⛲ Visite des Fontaines de Toulouse — ({establishments.length} Lieux)
            </h1>
            
            <div 
                ref={mapRef} 
                className="w-full h-[400px] mb-8 border-4 border-red-300 rounded-lg shadow-xl"
            />
            
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                Liste détaillée des fontaines (Cliquez pour les secrets)
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishments.map((est, i) => {
                    // L'ID est l'index + 1 si vous avez nommé vos fontaines 1. Nom, 2. Nom, etc.
                    // Sinon, il est plus sûr d'utiliser l'index + 1 comme ID unique dans le composant.
                    const id = i + 1; 
                    const isDetailsOpen = openDetailsId === id;

                    return (
                        <li 
                            key={i} 
                            id={`fontaine-item-${id}`} // ID pour le défilement
                            className="p-4 border rounded bg-white shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => toggleDetails(id)} // Clic bascule l'affichage
                        >
                            <p className="text-lg font-bold flex justify-between items-center">
                                <span>{est.name}</span>
                                {/* Indicateur de déploiement */}
                                <span className={`text-xl text-red-600 transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </p>
                            <p className="text-sm">{est.address}</p>
                            <p className="text-sm text-gray-600 italic mt-1">{est.description}</p>
                            
                            {/* Zone de description détaillée (Déploiement) */}
                            {isDetailsOpen && est.details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-800 animate-fadeIn">
                                    <h4 className="font-semibold mb-2 text-red-700">Détails Historiques et Artistiques:</h4>
                                    {/* Utilise dangerouslySetInnerHTML pour les sauts de ligne si nécessaire */}
                                    <div 
                                        className="prose max-w-none text-sm leading-relaxed" 
                                        dangerouslySetInnerHTML={{ 
                                            // Remplace les sauts de ligne (\n) par des balises <br/> pour le formatage
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

// NOTE: Pour que le CSS 'animate-fadeIn' fonctionne, assurez-vous d'avoir
// les classes d'animation définies dans votre fichier CSS global (e.g., globals.css)
// ou utilisez des transitions Tailwind CSS.
/* @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
*/
