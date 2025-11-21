import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio'; 
import ical, { VEvent } from 'ical'; 

// --- Configuration des Flux iCalendar (vos 15 URLs) ---
const ICAL_URLS = [
    "https://www.meetup.com/fr-FR/Espanoles-en-Toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/activites-tls-jeux-de-societe-diners-art-vin-outdoor/events/ical/",
    "https://www.meetup.com/fr-FR/Meetup-HarryCow-coworking-Toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/play-english-board-games-in-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/cercle-dambition-morale/events/ical/",
    "https://www.meetup.com/fr-FR/8f97cfe6-9d63-4268-bba2-e2b16db340bb/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-galleries-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/creative-mornings-running/events/ical/",
    "https://www.meetup.com/fr-FR/agile-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/espritwafu/events/ical/",
    "https://www.meetup.com/fr-fr/meetup-group-qbmdpprq/events/ical/",
    "https://www.meetup.com/fr-FR/speakenglishtoulouse/events/ical/",
    "https://www.meetup.com/fr-FR/yolo-toulouse-socializing-concerts-outings/events/ical/",
    "https://www.meetup.com/fr-FR/creative-mornings-running/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-sociale-meetup-group/events/ical/"
];

// --- Types de Données pour le retour API ---
type MeetupEventItem = {
  title: string;
  link: string;
  startDate: Date;      
  location: string;
  description: string;
  coverImage?: string; 
};

// --- Fonction de Scraping Ciblé de l'Image ---
async function scrapeCoverImage(url: string): Promise<string | undefined> {
    try {
        // NOTE: L'URL doit être une string valide. La vérification est faite dans GET.
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Impossible de scraper l'image sur : ${url}. Statut: ${res.status}`);
            return undefined;
        }
        const html = await res.text();
        const $ = cheerio.load(html);
        const ogImage = $('meta[property="og:image"]').attr('content');
        return ogImage;

    } catch (error) {
        console.error(`Erreur lors du scraping de l'image pour ${url}:`, error);
        return undefined;
    }
}

// --- Route Handler Principal (GET) ---
export async function GET(request: Request) {
    // 1. Extraction des paramètres de pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10); 
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startIndex = (page - 1) * limit;

    try {
        // 2. Récupération parallèle des flux iCalendar (Le code lourd mis en cache)
        const fetchPromises = ICAL_URLS.map(async url => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Erreur HTTP lors de la récupération de l'iCal: ${url}`);
            const data = await res.text();
            return ical.parseICS(data);
        });

        const allCalendars = await Promise.all(fetchPromises);
        const uniqueEventsMap = new Map<string, VEvent>();
        
        // 3. Déduplication des événements
        for (const calendar of allCalendars) {
            for (const key in calendar) {
                const event = calendar[key] as VEvent;
                if (event.type === 'VEVENT' && event.start) {
                    const uniqueKey = event.uid || event.summary + event.start.toISOString(); 
                    uniqueEventsMap.set(uniqueKey, event);
                }
            }
        }
        
        const uniqueEvents = Array.from(uniqueEventsMap.values());
        
        // 4. Traitement Parallèle (URL fix/Scraping image)
        const processedEventsPromises = uniqueEvents.map(async event => {
            const rawUrl = event.url;
            let url: string | undefined = undefined;

            // Fixe l'erreur [object Object]
            if (typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
                url = rawUrl;
            } else if (typeof rawUrl === 'object' && rawUrl !== null && 'val' in rawUrl && typeof rawUrl.val === 'string' && rawUrl.val.startsWith('http')) {
                url = rawUrl.val;
            }
            
            if (!url) {
                url = event.uid ? `https://www.meetup.com/fr-FR/events/${event.uid}/` : undefined;
            }
            
            let coverImage: string | undefined;

            if (url) { 
                coverImage = await scrapeCoverImage(url);
            }

            const eventItem: MeetupEventItem = {
                title: event.summary || 'Événement sans titre',
                link: url || '', 
                startDate: new Date(event.start),
                location: event.location || 'Lieu non spécifié',
                description: String(event.description || 'Pas de description.'), 
                coverImage: coverImage,
            };
            return eventItem;
        });

        let finalEvents = await Promise.all(processedEventsPromises);
        
        // 5. Filtrage (Événements dans le mois à venir) et Tri
        const now = new Date();
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(now.getMonth() + 1); 

        // Filtrer les événements passés
        finalEvents = finalEvents.filter(event => event.startDate.getTime() >= now.getTime());
        
        // Filtrer les événements au-delà d'un mois
        finalEvents = finalEvents.filter(event => event.startDate.getTime() <= oneMonthFromNow.getTime());

        // Trier
        finalEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        
        // 6. Pagination
        const totalEvents = finalEvents.length;
        const pagedEvents = finalEvents.slice(startIndex, startIndex + limit);

        // 7. Mise en cache hebdomadaire
        const ONE_WEEK_IN_SECONDS = 604800; // 7 jours

        const headers = {
            // Mise à jour de toutes les requêtes coûteuses 1 fois par semaine (7 jours)
            'Cache-Control': `public, s-maxage=${ONE_WEEK_IN_SECONDS}, stale-while-revalidate=${ONE_WEEK_IN_SECONDS}` 
        };

        return NextResponse.json({ 
          events: pagedEvents,
          totalEvents: totalEvents,
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
        }, { status: 200, headers });
        
    } catch (error) {
        console.error("Erreur critique lors du traitement des flux iCalendar:", error);
        return NextResponse.json(
          { error: "Impossible de charger les événements Meetup via iCalendar." }, 
          { status: 500 }
        );
    }
}