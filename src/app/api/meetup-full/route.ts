import { NextRequest, NextResponse } from "next/server";

// Liste optimisée : on ne garde que les sources uniques
const API_ROUTES = [
    "meetup-events", // Contient déjà les sorties, colocs et expats
    "atelatoi",      // Source spécifique avec scraping d'images
];

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache d'une heure

export async function GET(request: NextRequest) {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
                     request.nextUrl.origin ||
                     "http://localhost:3000";

    // 1. Lancement des appels en parallèle
    const fetchPromises = API_ROUTES.map(route =>
        fetch(`${BASE_URL}/api/${route}`, {
            next: { revalidate: 3600 }
        })
        .then(res => res.json())
        .catch(err => {
            console.error(`Erreur de fetch pour /api/${route}:`, err);
            return { events: [] };
        })
    );

    try {
        const results = await Promise.all(fetchPromises);

        // 2. Extraction et Normalisation
        const rawEvents: any[] = results.flatMap(r => {
            if (Array.isArray(r.events)) return r.events;
            if (Array.isArray(r)) return r;
            return [];
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 3. Traitement et Dédoublonnage intelligent
        const uniqueMap = new Map<string, any>();

        rawEvents.forEach(ev => {
            // Normalisation de la date
            const rawDate = ev.startDate || ev.date || ev.start;
            let d = rawDate ? new Date(rawDate) : null;

            if (!d || isNaN(d.getTime())) return;

            // Correction si la date est passée (ton ancienne logique)
            if (d < today) {
                d = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    d.getHours(),
                    d.getMinutes()
                );
            }

            // Normalisation de l'image (très important pour ne pas la perdre)
            const eventImage = ev.coverImage || ev.image;

            // Clé de dédoublonnage : Titre + Date (YYYY-MM-DD)
            const dateKey = d.toISOString().split("T")[0];
            const titleKey = (ev.title || "no-title").toLowerCase().trim();
            const key = `${titleKey}-${dateKey}`;

            const existing = uniqueMap.get(key);
            
            // PRIORITÉ : On garde l'événement si :
            // - Il est nouveau
            // - OU l'existant n'a pas d'image mais celui-ci en a une (cas d'Atélatoi)
            const hasRealImage = eventImage && !eventImage.includes('placeholder');

            if (!existing || (!existing.image && hasRealImage)) {
                uniqueMap.set(key, {
                    ...ev,
                    date: d.toISOString(), // Date corrigée/normalisée
                    image: eventImage,     // Clé d'image unique pour le front
                    fullAddress: ev.fullAddress || ev.location || "Toulouse"
                });
            }
        });

        // 4. Tri chronologique final
        const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        return NextResponse.json({ 
            events: unifiedEvents,
            count: unifiedEvents.length 
        });

    } catch (err: any) {
        return NextResponse.json(
            { events: [], error: err.message || "Erreur lors de l'agrégation" },
            { status: 500 }
        );
    }
}
