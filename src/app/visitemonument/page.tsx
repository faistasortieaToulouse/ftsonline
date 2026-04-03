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
    lat?: number;
    lng?: number;
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
    // 3. INITIALISATION LEAFLET
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
    // 4. MARQUEURS
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || places.length === 0) return;

        places.forEach((place, i) => {
            if (place.lat === undefined || place.lng === undefined) return;

            const id = i + 1;
            const customIcon = L.divIcon({
                className: 'marker-monument',
                html: `
                    <div style="
                        background-color: #dc2626;
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
                        <strong style="color: #991b1b; font-size: 14px;">${id}. ${place.nom}</strong><br/>
                        <p style="font-size: 11px; margin: 5px 0; color: #4b5563;">${place.type}</p>
                        <a href="#monument-item-${id}" style="display: inline-block; background-color: #dc2626; color: white; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 10px; font-weight: bold; margin-top: 4px;">Voir détails ↓</a>
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
                <Link href="/" className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-bold transition-all group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    Retour à l'accueil
                </Link>
            </nav>

            <header className="mb-8">
                <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight leading-tight uppercase">
                    🏛️ Monuments de Toulouse
                </h1>
                <p className="text-slate-500 font-medium tracking-wide italic">Histoire militaire, religieuse et civile — ({places.length} Lieux)</p>
            </header>

            {/* Carte */}
            <div
                ref={mapRef}
                className="mb-10 h-[60vh] border-4 border-white rounded-[2rem] bg-slate-200 relative z-0 overflow-hidden shadow-2xl"
            >
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-50/80"><p className="text-red-600 font-bold">{error}</p></div>}
                {loading && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-red-600 font-black text-xs uppercase tracking-[0.2em]">Chargement des archives...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
                <span className="h-1.5 w-12 bg-red-600 rounded-full"></span>
                LISTE DES ÉDIFICES
            </h2>

            {/* Liste en Grille */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {places.map((place, i) => {
                    const id = i + 1;
                    const isDetailsOpen = openDetailsId === id;
                    const numeroStr = place.numero && place.numero !== "0" ? `${place.numero} ` : "";

                    return (
                        <li 
                            key={i} 
                            id={`monument-item-${id}`} 
                            className={`p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col scroll-mt-24 ${
                                isDetailsOpen 
                                ? 'bg-red-50 border-red-400 shadow-lg scale-[1.01]' 
                                : 'bg-white border-white shadow-sm hover:border-red-100 hover:shadow-md'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-lg font-bold text-slate-900 leading-tight">
                                    <span className={`transition-colors ${isDetailsOpen ? 'text-red-600' : 'text-slate-300'}`}>{id}.</span> {place.nom}
                                </p>
                                <span className={`text-xl text-slate-400 transition-transform duration-300 ${isDetailsOpen ? 'rotate-180 scale-125 text-red-600' : 'rotate-0'}`}>
                                    ▼
                                </span>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-4">
                                <span className="text-red-500">📍</span> {numeroStr}{place.voie} {place.rue}
                            </p>

                            {isDetailsOpen && (
                                <div className="mt-2 pt-4 border-t border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-sm text-slate-700 mb-3 bg-white/70 p-3 rounded-xl border border-red-50">
                                        <span className="font-black text-red-800 uppercase text-[10px] block mb-1">Architecture / Type :</span> 
                                        {place.type}
                                    </p>
                                    {place.note && (
                                        <div className="p-3 bg-white/40 rounded-xl italic text-sm text-slate-600 leading-relaxed border-l-4 border-red-200">
                                            {place.note}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            <footer className="mt-20 py-10 border-t border-slate-200 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
                    Patrimoine Historique de Toulouse • Données Publiques
                </p>
            </footer>
        </div>
    );
}
