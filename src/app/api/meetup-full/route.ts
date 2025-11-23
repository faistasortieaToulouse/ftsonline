import { NextRequest, NextResponse } from "next/server";

// Liste de TOUTES les routes API à agréger
const API_ROUTES = [
    "agenda-trad",
    "cultureenmouvements",
    "demosphere",
    "hautegaronne",
    "radarsquat",
    "toulousemetropole",
    "tourismehautegaronne",
    "meetup-events",
    "meetup-expats", // Ajouter vos routes Meetup
    "meetup-coloc",
    "meetup-sorties",
];

// Revalidation : Mise en cache du résultat de l'agrégation pour 1 heure (3600s)
export const revalidate = 3600; 

export async function GET(request: NextRequest) {
    
    // 1. Déterminer l'origine de manière robuste
    // NEXT_PUBLIC_BASE_URL doit être défini dans vos variables d'environnement.
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 
                     request.nextUrl.origin || // Fonctionne si l'appel est fait depuis le client
                     'http://localhost:3000'; // Fallback Local

    const fetchPromises = API_ROUTES.map(route =>
        fetch(`${BASE_URL}/api/${route}`, {
            // Permet à Next.js de mettre en cache les résultats individuels
            // et de réutiliser le cache de chaque sous-route si possible.
            next: { revalidate: 3600 } 
        })
        .then(res => res.json())
        // Si une sous-route échoue (ex: 500 ou fetch failed), elle renvoie un tableau vide
        .catch(err => {
            console.error(`Erreur de fetch pour /api/${route}:`, err);
            return [];
        })
    );

    try {
        const results = await Promise.all(fetchPromises);

        // 2. Normalisation et Agrégation
        const events: any[] = results.flatMap(r => {
            if (Array.isArray(r.events)) return r.events;
            if (Array.isArray(r)) return r; // Certains flux retournent directement un tableau
            return [];
        });

        // 3. Supprimer doublons
        const uniqueMap = new Map<string, any>();
        events.forEach(ev => {
            // Création d'une clé d'unicité robuste
            const rawDate = ev.date || ev.startDate || ev.start;
            const rawTitle = ev.title || 'No Title';
            const rawLocation = ev.location || ev.fullAddress || 'No Location';

            // Assurez-vous que l'ID est une propriété sur vos objets MeetupEvents (comme vu précédemment)
            const key = ev.id || `${rawTitle}-${new Date(rawDate).toISOString().split('T')[0]}-${rawLocation}`;
            
            if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
        });

        // 4. Trier par date croissante
        const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
            const da = new Date(a.date || a.startDate || a.start);
            const db = new Date(b.date || b.startDate || b.start);
            return da.getTime() - db.getTime();
        });
        
        // Next.js mettra en cache cette réponse pendant la durée de `revalidate`
        return NextResponse.json({ events: unifiedEvents });

    } catch (err: any) {
        // En cas d'erreur critique après le fetch (ex: erreur de Promise.all), 
        // renvoyer une réponse d'erreur formatée.
        return NextResponse.json(
            { events: [], error: err.message || "Erreur lors de l'agrégation des données" }, 
            { status: 500 }
        );
    }
}