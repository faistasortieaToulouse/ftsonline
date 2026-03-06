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

        // 1. Boucle pour récupérer la TOTALITÉ des événements par lots
        // On s'arrête si hasNextLot est null ou si on dépasse 10 lots (sécurité)
        while (hasNextLot && currentLot < 10) {
            const res = await fetch(`${BASE_URL}/api/meetup-events?lot=${currentLot}`, {
                next: { revalidate: 3600 }
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

        // 2. Traitement et Dédoublonnage intelligent
        const uniqueMap = new Map<string, any>();

        allEvents.forEach(ev => {
            const rawDate = ev.startDate || ev.date || ev.start;
            let d = rawDate ? new Date(rawDate) : null;

            if (!d || isNaN(d.getTime())) return;

            // Correction date passée -> aujourd'hui
            if (d < today) {
                d = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    d.getHours(),
                    d.getMinutes()
                );
            }

            // Normalisation de l'image (priorité aux vraies images sur les placeholders)
            const eventImage = ev.coverImage || ev.image;
            const hasRealImage = eventImage && !eventImage.includes('placeholder');

            // Clé : Titre + Date (YYYY-MM-DD)
            const dateKey = d.toISOString().split("T")[0];
            const titleKey = (ev.title || "no-title").toLowerCase().trim();
            const key = `${titleKey}-${dateKey}`;

            const existing = uniqueMap.get(key);
            
            // On garde si nouveau OU si l'existant n'a pas d'image et le nouveau en a une
            if (!existing || (!existing.image && hasRealImage)) {
                uniqueMap.set(key, {
                    ...ev,
                    startDate: d.toISOString(),
                    image: eventImage,
                    fullAddress: ev.fullAddress || ev.location || "Toulouse"
                });
            }
        });

        // 3. Tri final
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
