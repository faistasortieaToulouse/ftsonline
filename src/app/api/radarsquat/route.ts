// src/app/api/radarsquat/route.ts
import { NextResponse, NextRequest } from "next/server";
import * as cheerio from 'cheerio';

// --- Cache en mémoire 12h ---
let cachedEvents: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 heures

// --- Utilitaire de conversion de date ---
function toISO(dateString: string | undefined): string | null {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString();
}

// --- Scraping HTML d'une page ---
function scrapeHtml(html: string): any[] {
    const $ = cheerio.load(html);
    const events: any[] = [];

    $('div.view-content article[typeof="Event"]').each((_, element) => {
        const $event = $(element);
        const title = $event.find('h4 a').text().trim() || null;
        const link = $event.find('h4 a[property="url"]').attr('href') || null;
        if (!title) return;

        const locationName = $event.find('div.grey span[property="name"]').text().trim() || null;
        const streetAddress = $event.find('div.grey span[property="streetAddress"]').text().trim() || null;
        const addressLocality = $event.find('div.grey span[property="addressLocality"]').text().trim() || null;
        const location = [locationName, streetAddress, addressLocality].filter(Boolean).join(', ');

        const dtstartContent = $event.find('span[property="schema:startDate"]').attr('content');
        const dtendContent = $event.find('span[property="schema:endDate"]').attr('content');
        const description = $event.find('.date-display-single, .date-display-range').nextAll().text().replace(/—\s*/, '').trim() || null;

        const startISO = toISO(dtstartContent);
        const endISO = toISO(dtendContent);

        if (startISO) {
            events.push({
                id: link,
                source: "Radar Squat Toulouse",
                title,
                description,
                location,
                link,
                start: startISO,
                end: endISO,
                image: "/logo/logoproxyradarsquat.jpg",
            });
        }
    });

    return events;
}

// --- Scraping de toutes les pages (max 5) ---
async function scrapeAllPages() {
    const BASE_URL = "https://radar.squat.net/fr/events/city/Toulouse";
    const MAX_PAGES = 5;
    const allScrapedEvents: any[] = [];

    for (let page = 0; page < MAX_PAGES; page++) {
        const URL_TO_FETCH = page === 0 ? BASE_URL : `${BASE_URL}?page=${page}`;
        console.log(`[SCRAPING] Fetching page: ${page} (${URL_TO_FETCH})`);

        const res = await fetch(URL_TO_FETCH, { headers: { "User-Agent": "NextJS Scraping Client" } });
        if (!res.ok) break;

        const html = await res.text();
        const eventsOnPage = scrapeHtml(html);
        if (eventsOnPage.length === 0 && page > 0) break;

        allScrapedEvents.push(...eventsOnPage);

        const lastEvent = eventsOnPage[eventsOnPage.length - 1];
        if (lastEvent && new Date(lastEvent.start).getTime() > Date.now() + 31*86400000) break;
    }

    return allScrapedEvents;
}

// --- Route GET ---
export async function GET(request: NextRequest) {
    const now = Date.now();

    // Retourne le cache si encore valide (12h)
    if (cachedEvents && now - cachedEvents.timestamp < CACHE_TTL) {
        return NextResponse.json(cachedEvents.data);
    }

    try {
        const allScrapedEvents = await scrapeAllPages();

        // Filtre 31 jours
        const futureLimit = now + 31 * 24 * 60 * 60 * 1000;
        const eventsFuture = allScrapedEvents.filter(e => {
            const startMs = new Date(e.start).getTime();
            const endMs = e.end ? new Date(e.end).getTime() : startMs;
            return endMs >= now && startMs < futureLimit;
        });

        // Mise à jour du cache
        cachedEvents = { data: eventsFuture, timestamp: now };

        console.log(`[DEBUG] Total scraped: ${allScrapedEvents.length}, future 31d: ${eventsFuture.length}`);

        return NextResponse.json(eventsFuture);
    } catch (error) {
        console.error("Échec du scraping:", error);
        return NextResponse.json({ error: "Échec du scraping HTML ou réseau." }, { status: 500 });
    }
}
