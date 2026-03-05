import { NextResponse } from 'next/server';
import ical, { VEvent } from 'ical';

export async function GET() {
  try {
    const url = "https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/ical/";
    const res = await fetch(url, { cache: 'no-store' }); // On force la fraîcheur pour le test
    const icsData = await res.text();
    const calendar = ical.parseICS(icsData);

    const filteredEvents = [];

    for (const key in calendar) {
      const event = calendar[key] as VEvent;
      
      if (event.type === 'VEVENT' && event.start) {
        const title = event.summary || "";
        const description = event.description || "";
        const location = event.location || "";
        
        // --- LOGIQUE DE FILTRAGE AMÉLIORÉE ---
        // On cherche "TOULOUSE" partout (Titre, Description ou Lieu)
        const contentToSearch = `${title} ${description} ${location}`.toLowerCase();
        
        if (contentToSearch.includes("toulouse")) {
          filteredEvents.push({
            title: title,
            date: event.start,
            // Si le lieu est vide dans le iCal, on met une valeur par défaut sympa
            location: location || "Toulouse (Lieu à confirmer dans la description)",
            link: event.url || `https://www.meetup.com/atelatoi-des-rencontres-et-discussion-a-bordeaux/events/${event.uid?.split('@')[0]}/`
          });
        }
      }
    }

    // Tri par date pour être propre
    filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ 
      source: "Atelatoi Bordeaux", 
      count: filteredEvents.length,
      events: filteredEvents 
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur de récupération" }, { status: 500 });
  }
}
