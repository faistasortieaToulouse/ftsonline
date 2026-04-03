"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Interface mise à jour
interface Gallery {
    name: string;
    address: string;
    url: string;
    lat: number;
    lng: number;
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
    // 3. INITIALISATION LEAFLET
    // ----------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || loading) return;

        const initMap = async () => {
            const Leaflet = (await import('leaflet')).default;
            setL(Leaflet);

            if (mapInstance.current) return;

            mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

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
            if (gallery.lat === undefined || gallery.lng === undefined) return;

            const id = i;
            const markerNumber = (i + 1).toString();

            const customIcon = L.divIcon({
                className: 'marker-galerie',
                html: `
                    <div style="
                        background-color: #2563eb;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        border: 2px solid white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 11px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    ">
                        ${markerNumber}
                    </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker([gallery.lat, gallery.lng], { icon: customIcon })
                .addTo(mapInstance.current!)
                .bindPopup(`
                    <div style="text-align: center; font-family: sans-serif;">
                        <strong style="color: #1e40af;">${markerNumber}. ${gallery.name}</strong><br/>
                        <p style="font-size: 11px; margin: 5px 0; color: #64748b;">${gallery.address}</p>
                        <a href="#gallery-item-${id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 5px;">Voir détails ↓</a>
                    </div>
                `);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([gallery.lat, gallery.lng], 16, { animate: true });
            });
        });
    }, [L, galleries]);

    // ----------------------------------------------------
    // 5. RENDU JSX
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            <nav className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Retour à l'accueil
                </Link>
            </nav>

            <header className="mb-8">
                <h1 className="text-3xl font-extrabold mb-2 text-blue-900 leading-tight">
                    🎨 Galeries d'Art de Toulouse
                </h1>
                <p className="text-slate-500 font-medium">Découvrez {galleries.length} espaces de création contemporaine</p>
            </header>

            {/* Conteneur de la Carte */}
            <div
                ref={mapRef}
                className="mb-10 h-[60vh] border-2 border-white rounded-3xl bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
            >
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-blue-600 font-bold text-xs uppercase tracking-widest">Préparation des cimaises...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                <span className="h-1.5 w-10 bg-blue-500 rounded-full"></span>
                LISTE DES GALERIES
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery, i) => {
                    const id = i;
                    const isDetailsOpen = openDetailsId === id;

                    return (
                        <li 
                            key={id} 
                            id={`gallery-item-${id}`} 
                            className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex gap-4 scroll-mt-24 ${
                                isDetailsOpen ? 'border-blue-400 bg-blue-50 shadow-lg scale-[1.02]' : 'border-white bg-white shadow-sm hover:border-blue-100 hover:shadow-md'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <span className={`text-2xl font-black transition-colors ${isDetailsOpen ? 'text-blue-600' : 'text-slate-300'}`}>
                                {i + 1}.
                            </span>
                            <div className="flex-grow">
                                <p className="text-lg font-bold flex justify-between items-start text-slate-900 leading-tight">
                                    <span className={isDetailsOpen ? 'text-blue-800' : ''}>{gallery.name}</span>
                                    <span className={`ml-2 text-xs transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                        ▼
                                    </span>
                                </p>
                                <p className="text-xs mt-2 text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                                    <span className="text-blue-400">📍</span> {gallery.address}
                                </p>
                                
                                {isDetailsOpen && (
                                    <div className="mt-4 pt-4 border-t border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h4 className="font-bold mb-2 text-blue-900 text-xs uppercase tracking-tighter">Site Officiel :</h4>
                                        <a 
                                            href={gallery.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 underline text-sm break-all font-medium inline-block"
                                            onClick={(e) => e.stopPropagation()} 
                                        >
                                            Consulter la galerie
                                        </a>
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <footer className="mt-16 py-8 border-t border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                    Toulouse Art Tour • Open Data
                </p>
            </footer>
        </div>
    );
}
