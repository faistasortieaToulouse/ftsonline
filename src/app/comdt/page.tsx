import React from "react";
import { headers } from "next/headers";

// Indique à Next.js que cette page DOIT être rendue dynamiquement à chaque requête.
export const dynamic = 'force-dynamic';

// Typage aligné avec le nouveau scraper HTML (non ICS)
interface EventItem {
    id: string;
    source: string;
    title: string;
    description: string | null;
    location: string | null;
    link: string;
    start: string | null;
    end: string | null;
    image: string | null;
}

// ====================================================================
// 1. Fonction de récupération des données (getEvents)
// ====================================================================
async function getEvents(): Promise<EventItem[]> {
    try {
        // Récupérer l'host courant via Next.js (doit être fait dans une fonction SSR)
        const host = headers().get("host") || "localhost:3000";
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        
        // Construction de l'URL pour la requête interne
        const baseUrl = `${protocol}://${host}`;

        const res = await fetch(`${baseUrl}/api/comdt`, {
            // Utiliser 'no-store' est correct ici car on veut la donnée la plus fraîche
            cache: "no-store", 
        });

        if (!res.ok) {
            console.error(`Local API fetch failed with status: ${res.status}`);
            return [];
        }

        const data = await res.json();
        // Le scraper HTML renvoie un tableau directement, pas d'objet { records: [] }
        // On vérifie que c'est bien un tableau
        return Array.isArray(data) ? data : [];
        
    } catch (err) {
        // @ts-ignore
        console.error("Error in getEvents:", err.message || err);
        return [];
    }
}

// ====================================================================
// 2. Composant principal
// ====================================================================
export default async function ComdtPage() {
    // Appel de la fonction côté serveur
    const events = await getEvents();

    // Fonction utilitaire pour formater les dates ISO
    const formatDate = (dateString?: string | null): string => {
        if (!dateString) return "Date non spécifiée";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Date invalide";

            return date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Erreur de formatage de la date";
        }
    };

    return (
        <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
                🎶 Agenda du COMT (Centre des Musiques et Danses Traditionnelles)
            </h1>

            {events.length === 0 ? (
                <p
                    style={{
                        color: "orange",
                        border: "1px solid orange",
                        padding: "15px",
                        borderRadius: "5px",
                        backgroundColor: "#fff0e0",
                        textAlign: "center",
                    }}
                >
                    Aucun événement trouvé ou erreur de chargement.
                    (Vérifiez le log du serveur pour l'erreur de scraping HTML sur le COMT.)
                </p>
            ) : (
                <section>
                    <h2 style={{ fontSize: "1.5em", marginBottom: "20px", color: "#1a5a9c" }}>
                        Événements trouvés : {events.length}
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "20px",
                        }}
                    >
                        {events.map((event, index) => {
                            const title = event.title || "Titre indisponible";
                            const startDate = event.start;
                            const description = event.description || "Description non disponible.";
                            const locationName = event.location || "Lieu non spécifié";
                            const url = event.link;

                            return (
                                <div
                                    key={event.id || index}
                                    style={{
                                        border: "1px solid #1a5a9c",
                                        padding: "15px",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                        backgroundColor: "#f0f8ff",
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <h3 style={{ color: "#0056b3", marginBottom: "10px" }}>{title}</h3>
                                    
                                    {event.image && (
                                        <div style={{ marginBottom: '10px' }}>
                                            {/* Image du scraper HTML (fallback sur une image générique en cas d'erreur) */}
                                            <img 
                                                src={event.image} 
                                                alt={`Illustration pour ${title}`} 
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    // Placeholder générique si l'image ne charge pas
                                                    target.onerror = null; 
                                                    target.src = "https://placehold.co/300x150/0056b3/ffffff?text=COMT+Agenda";
                                                }}
                                            />
                                        </div>
                                    )}

                                    <p style={{ marginBottom: "5px" }}>
                                        <strong>Quand :</strong> {formatDate(startDate)}
                                    </p>

                                    <p style={{ marginBottom: "5px" }}>
                                        <strong>Où :</strong> {locationName}
                                    </p>

                                    {url && (
                                        <p style={{ marginBottom: "10px" }}>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: "#00aaff", textDecoration: 'underline' }}
                                            >
                                                Voir les détails
                                            </a>
                                        </p>
                                    )}

                                    <details
                                        style={{
                                            marginTop: "10px",
                                            borderTop: "1px solid #cce5ff",
                                            paddingTop: "10px",
                                        }}
                                    >
                                        <summary
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#333",
                                            }}
                                        >
                                            Description
                                        </summary>
                                        <p
                                            style={{
                                                fontSize: "0.9em",
                                                marginTop: "5px",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {description}
                                        </p>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}