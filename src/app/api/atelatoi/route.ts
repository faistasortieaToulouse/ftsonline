import { NextResponse } from 'next/server';
import ical, { VEvent } from 'ical';
import * as cheerio from 'cheerio';

// Fonction pour récupérer l'image de couverture
async function getCoverImage(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    return $('meta[property="og:image"]').attr('content');
  } catch { return null; }
}

export async function GET() {
  try {
    const url = "https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/ical/";
    const res = await fetch(url, { cache: 'no-store' });
    const icsData = await res.text();
    const calendar = ical.parseICS(icsData);

    const events = [];

    for (const key in calendar) {
      const event = calendar[key] as VEvent;
      if (event.type === 'VEVENT' && event.start) {
        const title = event.summary || "";
        const description = event.description || "";
        const location = event.location || "";
        
        if (`${title} ${description} ${location}`.toLowerCase().includes("toulouse")) {
          const eventUrl = event.url || `https://www.meetup.com/fr-FR/events/${event.uid?.split('@')[0]}/`;
          
          // On récupère l'image (attention, cela ralentit un peu l'API de test)
          const coverImage = await getCoverImage(eventUrl);

          events.push({
            title,
            description, // On ajoute la description ici
            date: event.start,
            location: location || "Toulouse (Lieu dans la description)",
            link: eventUrl,
            coverImage // On ajoute l'image ici
          });
        }
      }
    }

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
