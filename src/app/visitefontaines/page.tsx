"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Establishment {
    name: string;
    address: string;
    description: string;
    details: string;
    lat?: number; // Optionnel pour éviter les crashs si absent
    lng?: number; // Optionnel pour éviter les crashs si absent
}

const TOULOUSE_CENTER: [number, number] = [43.6047, 1.4442];

export default function VisiteFontainesPage() {
    // ----------------------------------------------------
    // 1. ÉTATS ET RÉFÉRENCES
    // ----------------------------------------------------
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
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
        fetch("/api/visitefontaines")
            .then((res) => res.json())
            .then((data: Establishment[]) => {
                setEstablishments(Array.isArray(data) ? data : []);
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

            mapInstance.current = Leaflet.map(mapRef.current!).setView(TOULOUSE_CENTER, 14);

            Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
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
    // 4. MARQUEURS (SÉCURISÉS CONTRE LES UNDEFINED)
    // ----------------------------------------------------
    useEffect(() => {
        if (!L || !mapInstance.current || establishments.length === 0) return;

        // On nettoie les anciens marqueurs si nécessaire avant de reboucler
        // (Optionnel selon votre usage, ici on boucle simplement)
        
        establishments.forEach((est, i) => {
            // SÉCURITÉ : On vérifie que lat et lng existent bien avant de créer le marqueur
            if (est.lat === undefined || est.lng === undefined || est.lat === null) {
                console.warn(`⚠️ Coordonnées manquantes pour : ${est.name}`);
                return; 
            }

            const id = i + 1;
            const labelNumber = est.name.split('.')[0];

            const customIcon = L.divIcon({
                className: 'marker-fontaine',
                html: `
                    <div style="
                        background-color: #FF6600;
                        width: 26px;
                        height: 26px;
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
                        ${labelNumber}
                    </div>
                `,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });

            const marker = L.marker([est.lat, est.lng], { icon: customIcon })
                .addTo(mapInstance.current!)
                .bindPopup(`<strong>${est.name}</strong><br><small>${est.address}</small>`);

            marker.on('click', () => {
                toggleDetails(id);
                mapInstance.current.setView([est.lat, est.lng], 16);
                document.getElementById(`fontaine-item-${id}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            });
        });
    }, [L, establishments]);

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

            <h1 className="text-3xl font-extrabold mb-6 text-center text-slate-900 uppercase tracking-tight">
                ⛲ Visite des Fontaines de Toulouse — ({establishments.length} Lieux)
            </h1>

            <div
                ref={mapRef}
                style={{ height: "65vh", width: "100%" }}
                className="mb-8 border-2 border-slate-200 rounded-3xl bg-slate-50 flex items-center justify-center relative z-0 overflow-hidden shadow-xl"
            >
                {loading && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-orange-600 font-bold animate-pulse uppercase text-xs tracking-widest">Initialisation de la carte...</p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-800 border-b pb-4">
                Liste détaillée des fontaines
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {establishments.map((est, i) => {
                    const id = i + 1;
                    const isDetailsOpen = openDetailsId === id;

                    return (
                        <li 
                            key={i} 
                            id={`fontaine-item-${id}`} 
                            className={`group p-5 border rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                isDetailsOpen 
                                ? 'bg-orange-50 border-orange-300 shadow-md ring-1 ring-orange-200' 
                                : 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200'
                            }`}
                            onClick={() => toggleDetails(id)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`text-lg font-bold transition-colors ${isDetailsOpen ? 'text-orange-700' : 'text-slate-900'}`}>
                                        {est.name}
                                    </h3>
                                    <span className={`text-xl transition-transform duration-300 ${isDetailsOpen ? 'rotate-180 text-orange-600' : 'rotate-0 text-slate-300'}`}>
                                        ▼
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-1 italic flex items-center gap-1">
                                    📍 {est.address}
                                </p>
                                <p className="text-sm text-slate-600 leading-relaxed italic">{est.description}</p>
                                
                                {isDetailsOpen && est.details && (
                                    <div className="mt-4 pt-4 border-t border-orange-200 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h4 className="font-bold mb-2 text-orange-800 text-xs uppercase tracking-wider">Détails Historiques:</h4>
                                        <div 
                                            className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700" 
                                            dangerouslySetInnerHTML={{ 
                                                __html: est.details.replace(/\n/g, '<br/>') 
                                            }}
                                        />
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