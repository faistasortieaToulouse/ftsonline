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
    // 3. INITIALISATION LEAFLET
    // ----------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current || loading) return;

        const initMap = async () => {
            const Leaflet = (await import('leaflet')).default;
            setL(Leaflet);

            if (mapInstance.current) return;

            mapInstance.current = Leaflet.map(mapRef.current!).setView(JOLIMONT_CENTER, 15);

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
    // 4. MARQUEURS
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || places.length === 0) return;

        places.forEach((place, i) => {
            if (place.lat === undefined || place.lng === undefined) return;

            const id = i + 1;
            const customIcon = L.divIcon({
                className: 'marker-jolimont',
                html: `
                    <div style="
                        background-color: #3b82f6;
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
                        ${id}
                    </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker([place.lat, place.lng], { icon: customIcon })
                .addTo(mapInstance.current!)
                .bindPopup(`
                    <div style="text-align: center; font-family: sans-serif; min-width: 150px;">
                        <strong style="color: #1d4ed8; font-size: 14px;">${id}. ${place.nomLieu}</strong><br/>
                        <p style="font-size: 11px; margin: 5px 0; color: #64748b;">${place.établissement}</p>
                        <a href="#place-item-${id}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 4px;">Voir détails ↓</a>
                    </div>
                `);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([place.lat, place.lng], 16, { animate: true });
            });
        });
    }, [L, places]);

    // ----------------------------------------------------
    // 5. RENDU
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
                    🗺️ Circuit Historique de Jolimont
                </h1>
                <p className="text-slate-500 font-medium">Découvrez les secrets de ce quartier toulousain ({places.length} lieux)</p>
            </header>

            <div
                ref={mapRef}
                className="mb-10 h-[60vh] border-2 border-white rounded-3xl bg-slate-100 flex items-center justify-center relative z-0 overflow-hidden shadow-2xl"
            >
                {loading && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-600 font-bold animate-pulse text-xs tracking-widest uppercase">Chargement de la carte...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                <span className="h-1.5 w-10 bg-blue-500 rounded-full"></span>
                LIEUX À VISITER
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {places.map((place, i) => {
                    const id = i + 1;
                    const isDetailsOpen = openDetailsId === id;
                    const numero = place.num && place.num !== "0" ? `${place.num} ` : "";
                    const adresseComplete = `${numero}${place.typeRue} ${place.nomRue}`;

                    return (
                        <li 
                            key={i} 
                            id={`place-item-${id}`} 
                            className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                                isDetailsOpen 
                                ? 'bg-blue-50 border-blue-400 shadow-lg scale-[1.01]' 
                                : 'bg-white border-white shadow-sm hover:border-blue-100 hover:shadow-md'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className={`text-lg font-bold transition-colors ${isDetailsOpen ? 'text-blue-800' : 'text-slate-900'}`}>
                                    <span className="text-blue-500 mr-2">{id}.</span> {place.nomLieu}
                                </p>
                                <span className={`text-xl text-slate-400 font-bold transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-4">
                                <span className="text-blue-400">📍</span> {adresseComplete} • {place.quartier}
                            </p>

                            {isDetailsOpen && (
                                <div className="mt-2 pt-4 border-t border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm text-slate-700 mb-3 bg-white/60 p-3 rounded-xl border border-blue-50">
                                        <span className="font-bold text-blue-900 uppercase text-[10px] block mb-1">Catégorie :</span> 
                                        {place.établissement}
                                    </p>
                                    {place.signification && (
                                        <p className="text-sm text-slate-600 leading-relaxed italic px-1">
                                            <span className="font-bold text-blue-900 uppercase text-[10px] not-italic block mb-1">Contexte Historique :</span> 
                                            {place.signification}
                                        </p>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <footer className="mt-16 py-10 border-t border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">
                    Jolimont Historique • Patrimoine de Toulouse
                </p>
            </footer>
        </div>
    );
}
