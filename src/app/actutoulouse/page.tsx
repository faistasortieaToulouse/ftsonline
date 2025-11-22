// src/app/actutoulouse/page.tsx

import { headers } from 'next/headers';
import React from 'react';
// Importez ici les autres modules nécessaires (ex: EventItem type si défini ailleurs)

// ====================================================================
// NOUVELLE DIRECTIVE: Forcer le rendu dynamique
// Cela résout l'erreur Vercel car 'headers()' est utilisé ci-dessous.
export const dynamic = 'force-dynamic';
// ====================================================================

// Interface de base pour les événements (ajoutez les champs réels si vous en avez)
interface EventItem {
    id?: string;
    uid?: string;
    title?: string;
    name?: string;
    titre?: string;
    // ... ajoutez d'autres champs si nécessaires (date, description, etc.)
    [key: string]: any; // Fallback pour les champs non spécifiés
}

// ====================================================================
// 1. Fonction de récupération des données (getEvents)
// ====================================================================

async function getEvents(): Promise<EventItem[]> {
    try {
        // La déclaration 'let host' est maintenant CORRECTE
        let host = headers().get("host"); 
        
        if (!host) {
            // Dans certains environnements Vercel (Edge/Lambdas), le 'host' peut être vide.
            // Utiliser un fallback pour le développement.
            const defaultHost = process.env.NODE_ENV === "development" ? "localhost:3000" : null;
            if (!defaultHost) {
                // Pour Vercel en production, le domaine réel est souvent injecté. 
                // Si headers().get("host") échoue, il y a un problème de configuration.
                // On peut utiliser une URL absolue si elle est connue (mais on préfère la dynamique).
                throw new Error("Cannot determine host header for API call.");
            }
            host = defaultHost; 
        }
        
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        
        const apiUrl = `${protocol}://${host}/api/actutoulouse`;
        
        console.log(`Fetching local API: ${apiUrl}`); 
        
        const res = await fetch(apiUrl, {
            // Utiliser 'no-store' est essentiel pour les API dynamiques
            cache: 'no-store', 
        });
        
        if (!res.ok) {
            console.error(`Local API fetch failed with status: ${res.status}`);
            return []; 
        }

        const data = await res.json();
        // Assurez-vous que la structure de retour est correcte
        return Array.isArray(data.records) ? data.records : [];
        
    } catch (err) {
        // @ts-ignore
        console.error("Error in getEvents:", err.message || err);
        return [];
    }
}

// ====================================================================
// 2. Composant React principal (EXPORT PAR DÉFAUT)
// ====================================================================

/**
 * Ce composant est l'export par défaut requis par Next.js (page.tsx).
 */
export default async function ActuToulousePage() {
    // L'appel fonctionne maintenant car getEvents est défini au-dessus
    const events = await getEvents();

    return (
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#8b0000', marginBottom: '30px' }}>
                📰 Actualités et Événements à Toulouse
            </h1>
            
            {events.length === 0 ? (
                <p 
                    style={{ 
                        color: 'red', 
                        border: '1px solid #ff4500', 
                        padding: '15px', 
                        borderRadius: '5px',
                        backgroundColor: '#fffafa',
                        textAlign: 'center' 
                    }}
                >
                    Aucun événement trouvé ou erreur de chargement.
                    (Vérifiez le terminal serveur si le GET vers `/api/actutoulouse` renvoie une erreur 500/502.)
                </p>
            ) : (
                <section>
                    <h2 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#444' }}>
                        Articles trouvés : {events.length}
                    </h2>
                    <div 
                        style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                            gap: '20px' 
                        }}
                    >
                        {events.map((event, index) => (
                            <div 
                                key={event.id || event.uid || index} 
                                style={{ 
                                    border: '1px solid #ccc', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <h3 style={{ color: '#8b0000', marginBottom: '10px' }}>
                                    {event.title || event.name || event.titre || "Titre Indisponible"}
                                </h3>
                                {/* Vous pouvez ajouter ici plus de détails extraits de votre API, comme la date ou un résumé */}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}