"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Interface mise à jour pour inclure les coordonnées
interface Gallery {
    name: string;
    address: string;
    url: string;
    lat: number;
    lng: number; number;
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function VisiteGalerieArtPage() {
    // ----------------------------------------------------
    // 1. DÉCLARATIONS DES ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [L, setL] = useState<any>(null);
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null); 

    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ----------------------------------------------------
    // 2. CHARGEMENT DES DONNÉES
    // ----------------------------------------------------
    useEffect(() => {
        fetch("/api/visitegalerieart")
            .then((res) => res.json())
            .then((data: Gallery[]) => {
                setGalleries(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    // ----------------------------------------------------
    // 3. INITIALISATION LEAFLET (MÉTHODE OTAN)
    // ----------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || loading) return;

        const initMap = async () => {
            const Leaflet = (await import('leaflet')).default;
            setL(Leaflet);

            if (mapInstance.current) return;

            mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 13);

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapInstance.current);
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [loading]);

    // ----------------------------------------------------
    // 4. AJOUT DES MARQUEURS
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || galleries.length === 0) return;

        galleries.forEach((gallery, i) => {
            // Sécurité si les coordonnées sont absentes de l'API
            if (gallery.lat === undefined || gallery.lng === undefined) return;

            const id = i;
            const markerNumber = (i + 1).toString();

            const customIcon = L.divIcon({
                className: 'marker-galerie',
                html: `
                    <div style="
                        background-color: #007BFF;
                        width: 26px;
                        height: 26px;
                        border-radius: 50%;
                        border: 2px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 11px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">
                        ${markerNumber}
                    </div>
                `,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

const marker = L.marker([gallery.lat, gallery.lng], { icon: customIcon })
                .addTo(mapInstance.current!)
                .bindPopup(`<strong>${markerNumber}. ${gallery.name}</strong>`);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([gallery.latitude, gallery.longitude], 15);
                document.getElementById(`gallery-item-${id}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        });
    }, [L, galleries]);

    // ----------------------------------------------------
    // 5. RENDU JSX
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <nav className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Retour à l'accueil
                </Link>
            </nav>

            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800">
                🎨 Visite des Galeries d'Art à Toulouse — ({galleries.length} Lieux)
            </h1>

            {/* Conteneur de la Carte */}
            <div
                ref={mapRef}
                style={{ height: "60vh", width: "100%" }}
                className="mb-8 border-4 border-blue-200 rounded-xl bg-gray-50 flex items-center justify-center relative z-0 overflow-hidden shadow-2xl"
            >
                {loading && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Chargement de la carte...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-blue-700">
                Liste détaillée (Cliquez sur l'élément ou le marqueur)
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery, i) => {
                    const id = i;
                    const isDetailsOpen = openDetailsId === id;

                    return (
                        <li 
                            key={id} 
                            id={`gallery-item-${id}`} 
                            className={`p-5 border-2 rounded-lg transition-all duration-300 cursor-pointer flex ${
                                isDetailsOpen ? 'border-blue-400 bg-blue-50 shadow-inner' : 'border-gray-100 bg-white shadow-md hover:shadow-xl'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <span className="text-2xl font-extrabold text-blue-500 mr-4 flex-shrink-0">
                                {i + 1}.
                            </span>
                            <div className="flex-grow">
                                <p className="text-lg font-bold flex justify-between items-center text-blue-900">
                                    <span>{gallery.name}</span>
                                    <span className={`text-xl text-black font-bold transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        ▼
                                    </span>
                                </p>
                                <p className="text-sm mt-1 text-gray-600">
                                    <span className="font-semibold">Adresse:</span> {gallery.address}
                                </p>
                                
                                {isDetailsOpen && (
                                    <div className="mt-3 pt-3 border-t border-blue-100 animate-in fade-in slide-in-from-top-1 duration-300">
                                        <h4 className="font-semibold mb-1 text-blue-700 text-sm">Lien vers le site web:</h4>
                                        <a 
                                            href={gallery.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700 underline text-sm break-all"
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
