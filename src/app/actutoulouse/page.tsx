// src/app/actutoulouse/page.tsx

import { headers } from 'next/headers';
// Importez ici les autres modules nécessaires.

// ====================================================================
// 1. Fonction de récupération des données (getEvents) - DOIT ÊTRE DÉFINIE EN PREMIER
// ====================================================================

async function getEvents() {
    try {
        // La déclaration 'let host' est maintenant CORRECTE
        let host = headers().get("host"); 
        
        if (!host) {
            const defaultHost = process.env.NODE_ENV === "development" ? "localhost:9002" : null;
            if (!defaultHost) {
                throw new Error("Cannot determine host header.");
            }
            host = defaultHost; 
        }
        
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        
        const apiUrl = `${protocol}://${host}/api/actutoulouse`;
        
        console.log(`Fetching local API: ${apiUrl}`); 
        
        const res = await fetch(apiUrl, {
            cache: 'no-store', 
        });
        
        if (!res.ok) {
            console.error(`Local API fetch failed with status: ${res.status}`);
            return []; 
        }

        const data = await res.json();
        return data.records || [];
        
    } catch (err) {
        console.error("Error in getEvents:", err);
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
        <main style={{ padding: '20px' }}>
            <h1>📰 Actualités et Événements à Toulouse</h1>
            
            {events.length === 0 ? (
                <p style={{ color: 'orange', border: '1px solid orange', padding: '10px' }}>
                    Aucun événement trouvé ou erreur de chargement.
                    (Vérifiez le terminal serveur si le GET est 500 ou 502)
                </p>
            ) : (
                <section>
                    <h2>Événements trouvés : {events.length}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {/* ⚠️ Assurez-vous d'avoir ici le code d'affichage final avec les bons noms de champs (title, date, etc.) */}
                        {events.map((event, index) => (
                            <div 
                                key={event.id || event.uid || index} 
                                style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
                            >
                                <h3>{event.title || event.name || event.titre || "Titre Indisponible"}</h3>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}