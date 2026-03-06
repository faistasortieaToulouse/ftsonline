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

        // 1. Récupération de TOUS les lots (jusqu'à épuisement pour avoir les 86+)
        while (hasNextLot && currentLot < 15) { // Sécurité à 15 lots
            const res = await fetch(`${BASE_URL}/api/meetup-events?lot=${currentLot}`, {
                cache: 'no-store' // On évite le cache ici pour être sûr d'avoir les derniers lots
            });
            
            if (!res.ok) break;
            
            const data = await res.json();
            if (data.events && data.events.length > 0) {
                allEvents = [...allEvents, ...data.events];
            }

            if (data.nextLot !== null && data.nextLot !== undefined) {
                currentLot = data.nextLot;
            } else {
                hasNextLot = false;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Traitement et Dédoublonnage par URL (Le plus précis)
        const uniqueMap = new Map<string, any>();

        allEvents.forEach(ev => {
            const rawDate = ev.startDate || ev.date || ev.start;
            let d = rawDate ? new Date(rawDate) : null;

            if (!d || isNaN(d.getTime())) return;

            // Ta logique de correction de date
            if (d < today) {
                d = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    d.getHours(),
                    d.getMinutes()
                );
            }

            const eventImage = ev.coverImage || ev.image;
            // Vérification si l'image est valide (pas un placeholder vide)
            const hasRealImage = eventImage && 
                                 eventImage.startsWith('http') && 
                                 !eventImage.includes('placeholder');

            /**
             * LA CLÉ : On utilise l'URL (ev.link). 
             * C'est le seul identifiant vraiment unique entre Atélatoi et Meetup.
             */
            const key = ev.link || `${(ev.title || "").toLowerCase()}-${d.getTime()}`;

            const existing = uniqueMap.get(key);
            
            // On garde si :
            // - C'est nouveau
            // - OU si l'existant n'a pas d'image et que cette version en a une
            if (!existing || (!existing.hasImage && hasRealImage)) {
                uniqueMap.set(key, {
                    ...ev,
                    startDate: d.toISOString(),
                    image: eventImage,
                    hasImage: hasRealImage, // On stocke l'info pour la comparaison
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
