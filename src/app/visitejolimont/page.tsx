"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface JolimontPlace {
    nomLieu: string;
    num: string | number;
    typeRue: string;
    nomRue: string;
    quartier: string;
    établissement: string;
    signification: string;
    // Coordonnées nécessaires pour éviter le géocodage
    lat?: number;
    lng?: number;
}

const JOLIMONT_CENTER: [number, number] = [43.6150, 1.4650];

export default function VisiteJolimontPage() {
    // ----------------------------------------------------
    // 1. ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const [places, setPlaces] = useState<JolimontPlace[]>([]);
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
        fetch("/api/visitejolimont")
            .then((res) => res.json())
            .then((data: JolimontPlace[]) => {
                setPlaces(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur fetch:", err);
                setLoading(false);
            });
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

            mapInstance.current = Leaflet.map(mapRef.current!).setView(JOLIMONT_CENTER, 14);

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
    // 4. MARQUEURS (SANS GÉOCODAGE)
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || places.length === 0) return;

        places.forEach((place, i) => {
            // On n'affiche le marqueur que si les coordonnées existent dans l'API
            if (place.lat === undefined || place.lng === undefined) return;

            const id = i + 1;
            const customIcon = L.divIcon({
                className: 'marker-jolimont',
                html: `
                    <div style="
                        background-color: #007BFF;
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
                .bindPopup(`<strong>${id}. ${place.nomLieu}</strong>`);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([place.lat, place.lng], 16);
                document.getElementById(`place-item-${id}`)?.scrollIntoView({ 
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

            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-800">
                🗺️ Circuit Historique de Jolimont — ({places.length} Lieux)
            </h1>

            <div
                ref={mapRef}
                style={{ height: "65vh", width: "100%" }}
                className="mb-8 border-4 border-blue-200 rounded-xl bg-slate-50 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
            >
                {loading && <p className="text-blue-600 font-bold animate-pulse">Chargement de la carte...</p>}
            </div>

            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">
                Liste des lieux détaillés ({places.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {places.map((place, i) => {
                    const id = i + 1;
                    const isDetailsOpen = openDetailsId === id;
                    const numero = place.num && place.num !== "0" ? `${place.num} ` : "";
                    const adresseComplete = `${numero}${place.typeRue} ${place.nomRue}`;

                    return (
                        <li 
                            key={i} 
                            id={`place-item-${id}`} 
                            className={`p-5 border rounded-lg transition-all duration-300 cursor-pointer flex flex-col ${
                                isDetailsOpen 
                                ? 'bg-blue-50 border-blue-400 shadow-md' 
                                : 'bg-white border-slate-200 shadow hover:shadow-lg'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-lg font-bold text-blue-700">
                                    {id}. {place.nomLieu}
                                </p>
                                {/* Triangle Noir et Gras */}
                                <span className={`text-xl text-black font-bold transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </div>

                            <p className="text-sm italic text-gray-600">
                                📍 {adresseComplete} ({place.quartier})
                            </p>

                            {isDetailsOpen && (
                                <div className="mt-3 pt-3 border-t border-blue-200 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <p className="text-sm text-slate-700 mb-1">
                                        <span className="font-bold text-blue-800">Type :</span> {place.établissement}
                                    </p>
                                    {place.signification && (
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            <span className="font-bold text-blue-800">Détail :</span> {place.signification}
                                        </p>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}