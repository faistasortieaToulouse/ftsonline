import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import ical, { VEvent } from 'ical';

// --- Types de données (Identiques à ton meetup-events) ---
type MeetupEventItem = {
  title: string;
  link: string;
  startDate: Date;
  location: string;
  fullAddress: string;
  description: string;
  coverImage?: string;
};

// --- Scraping Amélioré (avec User-Agent pour les photos) ---
async function scrapeEventData(url: string): Promise<{ coverImage?: string; fullAddress?: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogImage = $('meta[property="og:image"]').attr('content');
    let fullAddress: string | undefined;

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const json = $(elem).html();
        if (!json) return;
        const data = JSON.parse(json);
        if (data['@type'] === 'Event' || data['@type'] === 'FoodEvent') {
          const addr = data.location?.address;
          if (addr?.streetAddress) {
            fullAddress = `${addr.streetAddress}, ${addr.addressLocality || ''}`.trim().replace(/,$/, '');
            return false;
          }
        }
      } catch {}
    });

    return { coverImage: ogImage, fullAddress };
  } catch { return {}; }
}

// --- Route API spécifique pour Atélatoi ---
export async function GET() {
  try {
    const url = "https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/ical/";
    const res = await fetch(url, { cache: 'no-store' });
    const icsData = await res.text();
    const calendar = ical.parseICS(icsData);

    const rawEvents: VEvent[] = [];
    for (const key in calendar) {
      const event = calendar[key] as VEvent;
      if (event.type === 'VEVENT' && event.start) {
        // FILTRE TOULOUSE : On ne garde que si "Toulouse" est mentionné
        const searchZone = `${event.summary} ${event.description} ${event.location}`.toLowerCase();
        if (searchZone.includes("toulouse")) {
          rawEvents.push(event);
        }
      }
    }

    // Traitement identique à ton fetchLot
    const processed = await Promise.all(rawEvents.map(async e => {
      let eventUrl: string | undefined;
      if (typeof e.url === "string" && e.url.startsWith("http")) eventUrl = e.url;
      else if (typeof e.url === "object" && e.url?.val?.startsWith("http")) eventUrl = e.url.val;
      else eventUrl = e.uid ? `https://www.meetup.com/fr-FR/events/${e.uid.split('@')[0]}/` : undefined;

      const extra = eventUrl ? await scrapeEventData(eventUrl) : {};

      const icalAddress = (e.location || '').trim();
      const jsonAddress = extra.fullAddress || '';
      const finalAddress = icalAddress || jsonAddress || "Toulouse (Lieu à confirmer)";

      return {
        title: e.summary || "Événement sans titre",
        link: eventUrl || "",
        startDate: new Date(e.start),
        location: e.location?.split(",")[0] || finalAddress,
        fullAddress: finalAddress,
        description: String(e.description || "Pas de description"),
        coverImage: extra.coverImage,
      } as MeetupEventItem;
    }));

    // Tri par date
    processed.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return NextResponse.json({ 
      events: processed, 
      count: processed.length 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: "Erreur lors du filtrage Atelatoi" }, { status: 500 });
  }
}
