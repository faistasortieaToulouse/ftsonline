import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import ical, { VEvent } from 'ical';

// --- Configuration des Flux iCalendar ---
const ICAL_URLS = [
    "https://www.meetup.com/fr-FR/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/"
];

// --- Types de Données ---
type MeetupEventItem = {
    title: string;
    link: string;
    startDate: Date;
    location: string;
    fullAddress: string;
    description: string;
    coverImage?: string;
};

// --- Scraping (image + adresse JSON-LD) ---
async function scrapeEventData(url: string): Promise<{ coverImage?: string; fullAddress?: string }> {
    try {
        const res = await fetch(url);
        if (!res.ok) return {};

        const html = await res.text();
        const $ = cheerio.load(html);

        const ogImage = $('meta[property="og:image"]').attr('content');

        let fullAddress: string | undefined;
        $('script[type="application/ld+json"]').each((i, elem) => {
            try {
                const json = $(elem).html();
                if (!json) return;

                const data = JSON.parse(json);

                if (data['@type'] === 'Event' || data['@type'] === 'FoodEvent') {
                    const addr = data.location?.address;
                    if (addr?.streetAddress) {
                        fullAddress =
                            `${addr.streetAddress}, ${addr.addressLocality || ''}`
                                .trim()
                                .replace(/,$/, '')
                                .trim();
                        return false;
                    }
                }
            } catch { }
        });

        return { coverImage: ogImage, fullAddress };
    } catch {
        return {};
    }
}

// --- ROUTE API ---
export async function GET(request: Request) {
    try {
        // 1. Lecture des flux iCal
        const fetchPromises = ICAL_URLS.map(async url => {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erreur iCal");
            return ical.parseICS(await res.text());
        });

        const allCalendars = await Promise.all(fetchPromises);

        // Déduplication
        const unique = new Map<string, VEvent>();

        for (const calendar of allCalendars) {
            for (const key in calendar) {
                const e = calendar[key] as VEvent;
                if (e.type === 'VEVENT' && e.start) {
                    const id = e.uid || e.summary + e.start.toISOString();
                    unique.set(id, e);
                }
            }
        }

        const uniqueEvents = Array.from(unique.values());

        // Scraping + normalisation
        const processed = uniqueEvents.map(async e => {
            let url: string | undefined;

            if (typeof e.url === "string" && e.url.startsWith("http")) url = e.url;
            else if (typeof e.url === "object" && e.url?.val?.startsWith("http")) url = e.url.val;
            else url = e.uid ? `https://www.meetup.com/fr-FR/events/${e.uid}/` : undefined;

            let extra = {};
            if (url) extra = await scrapeEventData(url);

            const icalAddress = (e.location || '').trim();
            const jsonLdAddress = (extra as any).fullAddress || '';
            const finalAddress = icalAddress || jsonLdAddress || "Lieu non spécifié";

            return {
                title: e.summary || "Événement sans titre",
                link: url || "",
                startDate: new Date(e.start),
                location: e.location?.split(",")[0] || finalAddress,
                fullAddress: finalAddress,
                description: String(e.description || "Pas de description"),
                coverImage: (extra as any).coverImage,
            } as MeetupEventItem;
        });

        let finalEvents = await Promise.all(processed);

        // FILTRE : Today → Today + 31 jours
        const now = new Date();
        const startFilter = new Date(now);
        startFilter.setHours(0, 0, 0, 0);

        const endFilter = new Date(startFilter.getTime() + 31 * 86400000);

        finalEvents = finalEvents.filter(e =>
            e.startDate >= startFilter &&
            e.startDate < endFilter
        );

        finalEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

        const totalEvents = finalEvents.length;

        // -----------------------------------------------------------
        // 🔥🔥🔥 CACHE : rafraîchissement deux fois par jour (4h et 16h)
        // -----------------------------------------------------------

        const nowHour = now.getHours();
        const nowMinutes = now.getMinutes();

        const times = [
            { hour: 4, minute: 0 },
            { hour: 16, minute: 0 }
        ];

        // Trouver la prochaine heure parmi 4:00 et 16:00
        let nextRefresh = new Date(now.getTime());
        nextRefresh.setSeconds(0, 0);

        const futureTriggers = times
            .map(t => {
                const d = new Date(now);
                d.setHours(t.hour, t.minute, 0, 0);

                if (d <= now) d.setDate(d.getDate() + 1);
                return d;
            })
            .sort((a, b) => a.getTime() - b.getTime());

        nextRefresh = futureTriggers[0];

        const secondsUntilRefresh = Math.floor((nextRefresh.getTime() - now.getTime()) / 1000);

        const headers = {
            "Cache-Control": `public, s-maxage=${secondsUntilRefresh}, stale-while-revalidate=43200` // 12 h fallback
        };

        // -----------------------------------------------------------

        return NextResponse.json(
            { events: finalEvents, totalEvents },
            { status: 200, headers }
        );

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des iCal" },
            { status: 500 }
        );
    }
}
