'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Monument {
    nom: string;
    numero: string | number;
    voie: string;
    rue: string;
    type: string;
    note: string;
    lat?: number; // Requis pour éviter le géocodage
    lng?: number; // Requis pour éviter le géocodage
}

const TOULOUSE_CENTER: [number, number] = [43.6045, 1.444];

export default function VisiteMonumentPage() {
    // ----------------------------------------------------
    // 1. ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const [places, setPlaces] = useState<Monument[]>([]);
    const [loading, setLoading] = useState(true);
    const [L, setL] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null);

    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ----------------------------------------------------
    // 2. RÉCUPÉRATION DES DONNÉES
    // ----------------------------------------------------
    useEffect(() => {
        fetch("/api/visitemonument")
            .then(async (res) => {
                if (!res.ok) throw new Error("Erreur réseau");
                const data: Monument[] = await res.json();
                setPlaces(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur Fetch :", err);
                setError("Impossible de charger les monuments.");
                setLoading(false);
            });
    }, []);

    // ----------------------------------------------------
    // 3. INITIALISATION LEAFLET (MÉTHODE OTAN)
    // ----------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || loading) return;

        const initMap = async () => {
            try {
                const Leaflet = (await import('leaflet')).default;
                setL(Leaflet);

                if (mapInstance.current) return;

                mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

                Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap'
                }).addTo(mapInstance.current);
            } catch (e) {
                console.error("Erreur Leaflet :", e);
            }
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
    // 4. MARQUEURS (SANS GÉOCODAGE)
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || places.length === 0) return;

        places.forEach((place, i) => {
            // On vérifie la présence des coordonnées
            if (place.lat === undefined || place.lng === undefined) return;

            const id = i + 1;
            const customIcon = L.divIcon({
                className: 'marker-monument',
                html: `
                    <div style="
                        background-color: #ef4444;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 2px solid black;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 11px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">
                        ${id}
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([place.lat, place.lng], { icon: customIcon })
                .addTo(mapInstance.current!)
                .bindPopup(`<strong>${id}. ${place.nom}</strong>`);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([place.lat, place.lng], 16);
                document.getElementById(`monument-item-${id}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        });
    }, [L, places]);

    // ----------------------------------------------------
    // 5. RENDU
    // ----------------------------------------------------
    return (
        <div className="p-4 max-w-7xl mx-auto">
            <nav className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-bold transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Retour à l'accueil
                </Link>
            </nav>

            <h1 className="text-3xl font-extrabold mb-6 text-slate-900">
                🗺️ Monuments militaires, religieux & civils par quartier — ({places.length} Lieux)
            </h1>

            {/* Carte */}
            <div
                ref={mapRef}
                style={{ height: "65vh", width: "100%" }}
                className="mb-8 border-4 border-slate-200 rounded-xl bg-gray-100 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
            >
                {error && <p className="text-red-600 font-bold">{error}</p>}
                {loading && !error && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Chargement de la carte...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-slate-800">
                Liste des monuments ({places.length})
            </h2>

            {/* Liste en Grille avec Accordéon */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {places.map((place, i) => {
                    const id = i + 1;
                    const isDetailsOpen = openDetailsId === id;
                    const numeroStr = place.numero && place.numero !== "0" ? `${place.numero} ` : "";

                    return (
                        <li 
                            key={i} 
                            id={`monument-item-${id}`} 
                            className={`p-5 border rounded-xl transition-all duration-300 cursor-pointer flex flex-col ${
                                isDetailsOpen 
                                ? 'bg-red-50 border-red-300 shadow-md ring-1 ring-red-100' 
                                : 'bg-white border-slate-200 shadow hover:shadow-lg'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-lg font-bold text-slate-900">
                                    <span className="text-red-600 mr-2">{id}.</span> {place.nom}
                                </p>
                                <span className={`text-xl text-black font-bold transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </div>

                            <p className="text-sm italic text-slate-600 mt-1">
                                📍 {numeroStr}{place.voie} {place.rue}
                            </p>

                            {isDetailsOpen && (
                                <div className="mt-3 pt-3 border-t border-red-200 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <p className="text-sm text-slate-800">
                                        <span className="font-bold">Type :</span> {place.type}
                                    </p>
                                    {place.note && (
                                        <div className="mt-2 p-3 bg-white/50 rounded-lg border border-red-100 italic text-sm text-slate-700">
                                            {place.note}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <p className="mt-8 text-center font-medium text-slate-400 text-sm">
                Propulsé par Leaflet & OpenStreetMap
            </p>
        </div>
    );
}