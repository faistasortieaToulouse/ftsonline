import { NextRequest, NextResponse } from "next/server";

// Liste de TOUTES les routes API à agréger
const API_ROUTES = [
    "meetup-events",
    "meetup-expats",
    "meetup-coloc",
    "meetup-sorties",
    "atelatoi",
];

// 🤘 IMPORTANT : Meetup renvoie du HTML ou bloque → route doit être dynamique
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1h

export async function GET(request: NextRequest) {

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
                     request.nextUrl.origin ||
                     "http://localhost:3000";

    const fetchPromises = API_ROUTES.map(route =>
        fetch(`${BASE_URL}/api/${route}`, {
            next: { revalidate: 3600 }
        })
        .then(res => res.json())
        .catch(err => {
            console.error(`Erreur de fetch pour /api/${route}:`, err);
            return [];
        })
    );

    try {
        const results = await Promise.all(fetchPromises);

        // 2. Normalisation et Agrégation
        let events: any[] = results.flatMap(r => {
            if (Array.isArray(r.events)) return r.events;
            if (Array.isArray(r)) return r;
            return [];
        });

        // --------------------------------------------------
        // 🟧  CORRECTION : si la date est passée -> mettre aujourd’hui
        // --------------------------------------------------
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        events = events.map(ev => {
            const raw = ev.date || ev.startDate || ev.start;
            const d = raw ? new Date(raw) : null;

            if (!d || isNaN(d.getTime())) return ev;

            if (d < today) {
                // Conserve l’heure d’origine si elle existe
                const corrected = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    d.getHours(),
                    d.getMinutes(),
                    d.getSeconds()
                );
                return { ...ev, date: corrected.toISOString() };
            }

            return ev;
        });
        // --------------------------------------------------

        // 3. Supprimer doublons
        const uniqueMap = new Map<string, any>();
        events.forEach(ev => {
            const rawDate = ev.date || ev.startDate || ev.start;
            const rawTitle = ev.title || "No Title";
            const rawLocation = ev.location || ev.fullAddress || "No Location";

            const key = ev.id || `${rawTitle}-${new Date(rawDate).toISOString().split("T")[0]}-${rawLocation}`;

            if (!uniqueMap.has(key)) uniqueMap.set(key, ev);
        });

        // 4. Trier par date croissante
        const unifiedEvents = Array.from(uniqueMap.values()).sort((a, b) => {
            const da = new Date(a.date || a.startDate || a.start);
            const db = new Date(b.date || b.startDate || b.start);
            return da.getTime() - db.getTime();
        });

        return NextResponse.json({ events: unifiedEvents });

    } catch (err: any) {
        return NextResponse.json(
            { events: [], error: err.message || "Erreur lors de l'agrégation des données" },
            { status: 500 }
        );
    }
}
