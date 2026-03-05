import { NextResponse } from 'next/server';
import ical, { VEvent } from 'ical';
import * as cheerio from 'cheerio';

type MeetupEventItem = {
  title: string;
  link: string;
  startDate: Date;
  location: string;
  fullAddress: string;
  description: string;
  coverImage?: string;
};

async function scrapeImage(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const html = await res.text();
    const $ = cheerio.load(html);
    return $('meta[property="og:image"]').attr('content');
  } catch { return undefined; }
}

export async function GET() {
  try {
    const url = "https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/ical/";
    const res = await fetch(url, { cache: 'no-store' });
    const icsData = await res.text();
    const calendar = ical.parseICS(icsData);

    const filteredEvents: MeetupEventItem[] = [];

    for (const key in calendar) {
      const event = calendar[key] as VEvent;
      if (event.type === 'VEVENT' && event.start) {
        const title = event.summary || "";
        const description = event.description || "";
        const location = event.location || "";
        
        // Scan global pour trouver Toulouse (Choix B)
        const searchZone = `${title} ${description} ${location}`.toLowerCase();
        
        if (searchZone.includes("toulouse")) {
          const eventLink = event.url || `https://www.meetup.com/fr-FR/events/${event.uid?.split('@')[0]}/`;
          const coverImage = await scrapeImage(eventLink);

          filteredEvents.push({
            title,
            link: eventLink,
            startDate: new Date(event.start),
            location: location || "Toulouse",
            fullAddress: location || "Toulouse (voir description)",
            description: String(description),
            coverImage
          });
        }
      }
    }

    return NextResponse.json({ events: filteredEvents, count: filteredEvents.length });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
