// src/app/api/radarsquat/route.ts
// Solution finale avec scraping HTML, filtre 31 jours, et gestion de la pagination.

import { NextResponse, NextRequest } from "next/server";
import * as cheerio from 'cheerio'; 

// --- Fonction utilitaire de date ---
function toISO(dateString: string | undefined): string | null {
    if (!dateString) return null;
    try {
        const date = new Date(dateString); 
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
    } catch (e) {
        return null;
    }
}

// --- Fonction de scraping HTML ---
function scrapeHtml(html: string): any[] {
    const $ = cheerio.load(html);
    const events: any[] = [];
    
    // Ciblage précis pour ne prendre que les articles d'événements à l'intérieur du conteneur de vue
    const $events = $('div.view-content article[typeof="Event"]'); 

    $events.each((index, element) => {
        const $event = $(element);
        
        // 1. Extraction du titre et du lien
        const title = $event.find('h4 a').text().trim() || null;
        const link = $event.find('h4 a[property="url"]').attr('href') || null;
        
        if (!title) return; 

        // 2. Extraction du lieu
        const locationName = $event.find('div.grey span[property="name"]').text().trim() || null;
        const streetAddress = $event.find('div.grey span[property="streetAddress"]').text().trim() || null;
        const addressLocality = $event.find('div.grey span[property="addressLocality"]').text().trim() || null;
        const location = [locationName, streetAddress, addressLocality].filter(Boolean).join(', ');
        
        // 3. Extraction des dates à partir de l'attribut 'content' (Schema.org)
        const dtstartContent = $event.find('span[property="schema:startDate"]').attr('content');
        const dtendContent = $event.find('span[property="schema:endDate"]').attr('content');
        
        // 4. Extraction de la description/tags (texte après la date de fin)
        let description = $event.find('.date-display-single, .date-display-range').nextAll().text();
        
        // 5. Conversion des dates
        const startISO = toISO(dtstartContent);
        const endISO = toISO(dtendContent);

        // Validation minimale
        if (startISO) {
            events.push({
                id: link,
                source: "Radar Squat Toulouse",
                title: title,
                description: description.replace(/—\s*/, '').trim() || null, 
                location: location,
                link: link,
                start: startISO,
                end: endISO,
                image: "/logo/logoproxyradarsquat.jpg",
            });
        }
    });

    return events;
}


// --- Fonction GET (API Route) ---
export async function GET(request: NextRequest) {
    const BASE_URL = "https://radar.squat.net/fr/events/city/Toulouse";
    const MAX_PAGES = 5; // Scrape jusqu'à 5 pages (page 0 à 4) pour couvrir 31 jours
    let allScrapedEvents: any[] = [];
    
    // Définition de la limite de temps pour le filtre
    const now = Date.now();
    const futureLimit = now + (31 * 24 * 60 * 60 * 1000); // 31 jours en millisecondes
    
    try {
        for (let page = 0; page < MAX_PAGES; page++) {
            // Construit l'URL : la page 0 n'a pas de paramètre "?page=0"
            const URL_TO_FETCH = page === 0 ? BASE_URL : `${BASE_URL}?page=${page}`;
            
            console.log(`[SCRAPING] Fetching page: ${page} (${URL_TO_FETCH})`);

            const res = await fetch(URL_TO_FETCH, {
                headers: { 
                    "User-Agent": "NextJS Scraping Client" 
                },
                // Révalidation du cache pour toutes les pages
                next: { revalidate: 3600 }, 
            });

            if (!res.ok) {
                console.error(`Erreur lors du scraping de la page ${page}: ${res.status}`);
                break; // Arrête la boucle si une page renvoie une erreur
            }

            const html = await res.text();
            const eventsOnPage = scrapeHtml(html);
            
            // Si la page est vide (et n'est pas la page 0), on arrête
            if (eventsOnPage.length === 0 && page > 0) {
                 console.log(`[SCRAPING] Reached end of events on page ${page}. Stopping.`);
                break; 
            }

            // Ajoute les événements de cette page à la liste globale
            allScrapedEvents.push(...eventsOnPage);

            // --- Vérification précoce pour optimiser : Si le dernier événement dépasse le 31ème jour, on arrête ---
            const lastEvent = eventsOnPage[eventsOnPage.length - 1];
            if (lastEvent && lastEvent.start) {
                const lastEventStartMs = new Date(lastEvent.start).getTime();
                if (lastEventStartMs > futureLimit) {
                    console.log(`[SCRAPING] Last event on page ${page} is outside 31-day limit. Stopping pagination early.`);
                    break; 
                }
            }
        }

        // --- FILTRAGE FINAL SUR LA LISTE COMPLÈTE ---
        const searchParams = request.nextUrl.searchParams;
        const includePast = searchParams.get('past') === 'true';

        if (includePast) {
            // Si le mode "passé" est activé, on retourne tout ce qui a été scrappé
            return NextResponse.json(allScrapedEvents);
        }
        
        // Appliquer le filtre strict des 31 jours (à partir de maintenant)
        const eventsFuture = allScrapedEvents.filter(e => {
            if (!e.start) return false; 
            
            const eventStartMs = new Date(e.start).getTime();
            const eventEndMs = e.end ? new Date(e.end).getTime() : eventStartMs; 

            // Condition 1: L'événement n'est pas terminé (il est en cours ou à venir)
            const isFuture = eventEndMs >= now;

            // Condition 2: L'événement commence dans la fenêtre des 31 jours
            const isWithinLimit = eventStartMs < futureLimit; 
            
            return isFuture && isWithinLimit;
        });

        // DEBUG : Afficher le nombre d'événements trouvés
        console.log(`[DEBUG FILTER] Total Scraped Events (all pages): ${allScrapedEvents.length}`);
        console.log(`[DEBUG FILTER] Final Future Events Count (31 days): ${eventsFuture.length}`);

        return NextResponse.json(eventsFuture);
        
    } catch (error) {
        console.error("Échec du scraping (GÉNÉRAL):", error);
        // Utilise NextResponse qui est importé en haut
        return NextResponse.json(
            { error: "Échec du scraping HTML ou du réseau." }, 
            { status: 500 }
        );
    }
}