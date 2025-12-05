// /src/app/visitefontaines/page.tsx - MODIFICATIONS CLÉS

"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface Establishment {
    name: string;
    address: string;
    description: string;
    details: string; // Doit être présent dans votre API
}

export default function VisiteFontainesPage() {
    // ... (mapRef, mapInstance, establishments, isReady restent inchangés)
    
    // NOUVEAU: État pour gérer la fontaine dont les détails sont affichés
    // On stocke l'ID (ou l'index) de la fontaine sélectionnée
    const [openDetailsId, setOpenDetailsId] = useState<number | null>(null); 

    // Fonction pour basculer l'affichage des détails
    const toggleDetails = (id: number) => {
        setOpenDetailsId(prevId => (prevId === id ? null : id));
    };

    // ... (Le useEffect de fetch reste inchangé)

    // ... (Le useEffect de la carte reste inchangé, sauf pour l'InfoWindow)
    useEffect(() => {
        if (!isReady || !mapRef.current || establishments.length === 0) return;

        if (mapInstance.current) {
            return;
        }

        // ... (Initialisation de la carte)

        const geocoder = new google.maps.Geocoder();
        const map = mapInstance.current;

        establishments.forEach((est, i) => {
            // ... (code de géocodage inchangé)

            setTimeout(() => {
                geocoder.geocode({ address: est.address }, (results, status) => {
                    // ... (Vérification du statut)

                    const labelNumber = est.name.split('.')[0]; 
                    
                    const marker = new google.maps.Marker({
                        // ... (Définition du marqueur inchangée)
                    });

                    // MODIFICATION : Au clic sur le marqueur, on change l'état d'ouverture de la liste
                    marker.addListener("click", () => {
                        // On trouve l'ID de la fontaine (assumons qu'il est dans le nom)
                        const id = parseInt(labelNumber);
                        if (!isNaN(id)) {
                            toggleDetails(id);
                            
                            // Optionnel: Faire défiler la page jusqu'à l'élément
                            document.getElementById(`fontaine-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }); 
                    
                    // L'infowindow peut juste afficher un petit texte simple si vous le souhaitez
                    const infowindow = new google.maps.InfoWindow({
                        content: `<strong>${est.name}</strong><br>Cliquez pour voir les détails en bas.`,
                    });
                    
                    // ... (Ajout du listener pour l'infowindow)
                });
            }, i * 300); 
        });
    }, [isReady, establishments]); // Note: 'toggleDetails' n'est pas nécessaire dans les dépendances car c'est une fonction de setState

    // ... (Rendu JSX)

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* ... Script, Titre, Carte ... */}
            
            <h2 className="text-2xl font-semibold mb-4">
                Liste des fontaines ({establishments.length})
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {establishments.map((est, i) => {
                    const id = i + 1; // L'ID est l'index + 1
                    const isDetailsOpen = openDetailsId === id; // Vérifie si cette fontaine doit être déployée

                    return (
                        <li 
                            key={i} 
                            id={`fontaine-item-${id}`} // ID pour le défilement
                            className="p-4 border rounded bg-white shadow transition-all duration-300"
                            onClick={() => toggleDetails(id)} // Clic bascule l'affichage
                        >
                            <p className="text-lg font-bold flex justify-between items-center cursor-pointer">
                                <span>{est.name}</span>
                                {/* Indicateur de déploiement */}
                                <span className="text-xl text-red-600">
                                    {isDetailsOpen ? '▲' : '▼'}
                                </span>
                            </p>
                            <p className="text-sm">{est.address}</p>
                            <p className="text-sm text-gray-600 italic mt-1">{est.description}</p>
                            
                            {/* NOUVEAU: Zone de description détaillée (Déploiement) */}
                            {isDetailsOpen && est.details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-800 animate-fadeIn">
                                    <h4 className="font-semibold mb-2">Détails Historiques et Artistiques:</h4>
                                    {/* Utiliser dangerouslySetInnerHTML pour le formatage du texte (sauts de ligne, etc.) */}
                                    <div 
                                        className="prose max-w-none text-sm" 
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
// Ajoutez ces styles à votre fichier CSS global (tailwind.css ou équivalent) si vous utilisez Tailwind CSS
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
