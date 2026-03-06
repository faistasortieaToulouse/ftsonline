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

        // 1. Récupération des lots Meetup classiques
        while (hasNextLot && currentLot < 25) {
            const res = await fetch(`${BASE_URL}/api/meetup-events?lot=${currentLot}`, {
                cache: 'no-store'
            });
            
            if (!res.ok) break;
            
            const data = await res.json();
            if (data.events && data.events.length > 0) {
                allEvents = [...allEvents, ...data.events];
            }

            if (data.nextLot !== null && data.nextLot !== undefined && data.nextLot > currentLot) {
                currentLot = data.nextLot;
            } else {
                hasNextLot = false;
            }
        }

        // 2. Récupération spécifique d'Atelatoi (ton 86ème élément)
        try {
            const atelatoiRes = await fetch(`${BASE_URL}/api/atelatoi`, { cache: 'no-store' });
            if (atelatoiRes.ok) {
                const atelatoiData = await atelatoiRes.json();
                if (atelatoiData.events && atelatoiData.events.length > 0) {
                    allEvents = [...allEvents, ...atelatoiData.events];
                }
            }
        } catch (e) {
            console.error("Erreur lors de la récupération d'Atelatoi:", e);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 3. Dédoublonnage et Unification
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

            // Utilisation du lien (URL) comme identifiant unique
            const key = ev.link || `${(ev.title || "").toLowerCase().trim()}-${d.getTime()}`;

            const existing = uniqueMap.get(key);
            
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

        // 4. Tri chronologique
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
