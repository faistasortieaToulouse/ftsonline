import { NextResponse } from 'next/server';
import ical, { VEvent } from 'ical';

export async function GET() {
  try {
    const url = "https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/ical/";
    const res = await fetch(url, { next: { revalidate: 60 } }); // Cache d'une minute pour les tests
    const icsData = await res.text();
    const calendar = ical.parseICS(icsData);

    const filteredEvents = [];

    for (const key in calendar) {
      const event = calendar[key] as VEvent;
      
      if (event.type === 'VEVENT' && event.start) {
        const summary = event.summary || "Sans titre";
        const location = event.location || "";
        
        // TEST DE FILTRAGE : On cherche "Toulouse" dans le lieu
        if (location.toLowerCase().includes("toulouse")) {
          filteredEvents.push({
            title: summary,
            date: event.start,
            location: location,
            link: event.uid ? `https://www.meetup.com/fr-FR/events/${event.uid}/` : event.url
          });
        }
      }
    }

    return NextResponse.json({ 
      source: "Atelatoi Bordeaux", 
      count: filteredEvents.length,
      events: filteredEvents 
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur de récupération" }, { status: 500 });
  }
}
