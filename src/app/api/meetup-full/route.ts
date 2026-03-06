import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; 

export async function GET(request: NextRequest) {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
                     request.nextUrl.origin ||
                     "http://localhost:3000";

    try {
        let allEvents: any[] = [];
        let currentLot = 0;
        let hasNextLot = true;

        // 1. Récupération exhaustive de tous les lots
        while (hasNextLot && currentLot < 25) { // Sécurité augmentée à 25 lots
            const res = await fetch(`${BASE_URL}/api/meetup-events?lot=${currentLot}`, {
                cache: 'no-store'
            });
            
            if (!res.ok) break;
            
            const data = await res.json();
            if (data.events && data.events.length > 0) {
                allEvents = [...allEvents, ...data.events];
            }

            // Gestion sécurisée de la suite des lots
            if (data.nextLot !== null && data.nextLot !== undefined && data.nextLot > currentLot) {
                currentLot = data.nextLot;
            } else {
                hasNextLot = false;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Dédoublonnage par URL (Le lien est l'identifiant le plus fiable)
        const uniqueMap = new Map<string, any>();

        allEvents.forEach(ev => {
            const rawDate = ev.startDate || ev.date || ev.start;
            let d = rawDate ? new Date(rawDate) : null;
            if (!d || isNaN(d.getTime())) return;

            // Correction des dates passées vers aujourd'hui
            if (d < today) {
                d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), d.getHours(), d.getMinutes());
            }

            const eventImage = ev.coverImage || ev.image;
            const hasRealImage = eventImage && eventImage.startsWith('http') && !eventImage.includes('placeholder');

            /**
             * LA CLÉ : On utilise l'URL (ev.link). 
             * Si Atélatoi a un lien unique, il ne sera plus écrasé par un autre événement.
             * Si pas de lien, on crée une clé de secours Titre + Timestamp.
             */
            const key = ev.link || `${(ev.title || "").toLowerCase().trim()}-${d.getTime()}`;

            const existing = uniqueMap.get(key);
            
            // On garde si :
            // - C'est un nouvel événement
            // - OU si l'existant n'avait pas d'image et que celui-ci en a une
            if (!existing || (!existing.hasImage && hasRealImage)) {
                uniqueMap.set(key, {
                    ...ev,
                    startDate: d.toISOString(),
                    image: eventImage,
                    hasImage: hasRealImage,
                    fullAddress: ev.fullAddress || ev.location || "Toulouse"
                });
            }
        });

        // 3. Tri chronologique final
        const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
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
