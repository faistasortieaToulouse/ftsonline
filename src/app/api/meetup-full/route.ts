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

        // 1. Récupération exhaustive
        while (hasNextLot && currentLot < 20) { 
            const res = await fetch(`${BASE_URL}/api/meetup-events?lot=${currentLot}`, {
                cache: 'no-store'
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

        const uniqueMap = new Map<string, any>();

        allEvents.forEach(ev => {
            const rawDate = ev.startDate || ev.date || ev.start;
            let d = rawDate ? new Date(rawDate) : null;
            if (!d || isNaN(d.getTime())) return;

            if (d < today) {
                d = new Date(today.getFullYear(), today.getMonth(), today.getDate(), d.getHours(), d.getMinutes());
            }

            const eventImage = ev.coverImage || ev.image;
            const hasRealImage = eventImage && eventImage.startsWith('http') && !eventImage.includes('placeholder');

            // CLÉ ROBUSTE : On combine le titre normalisé et la date courte (YYYY-MM-DD)
            // Cela permet de garder Atelatoi même si l'URL est différente mais le titre unique.
            const dateKey = d.toISOString().split('T')[0];
            const titleKey = (ev.title || "").toLowerCase().trim();
            const key = `${titleKey}-${dateKey}`;

            const existing = uniqueMap.get(key);
            
            // On garde si nouveau OU si la nouvelle version apporte une image
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

        const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });

        return NextResponse.json({ 
            events: unifiedEvents,
            count: unifiedEvents.length 
        });

    } catch (err: any) {
        return NextResponse.json(
            { events: [], error: err.message || "Erreur" },
            { status: 500 }
        );
    }
}
