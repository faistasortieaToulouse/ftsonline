import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import ical, { VEvent } from 'ical';

// --- Configuration des Flux iCalendar ---
const ICAL_GROUPS: string[][] = [
  // Lot 1
  [
    "https://www.meetup.com/fr-FR/Espanoles-en-Toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/activites-tls-jeux-de-societe-diners-art-vin-outdoor/events/ical/",
    "https://www.meetup.com/fr-FR/play-english-board-games-in-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-galleries-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/creative-mornings-running/events/ical/",
    "https://www.meetup.com/fr-FR/agile-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/espritwafu/events/ical/",
    "https://www.meetup.com/fr-FR/speakenglishtoulouse/events/ical/",
    "https://www.meetup.com/fr-FR/yolo-toulouse-socializing-concerts-outings/events/ical/",
    "https://www.meetup.com/club-de-reflexion-discussions-sur-l-actualite/events/ical/",
    "https://www.meetup.com/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/",
    "https://www.meetup.com/toulouse-sorties-evenements-soirees-balades-visites-randos/events/ical/",
    "https://www.meetup.com/expats-in-toulouse/events/ical/"
  ],
  // Lot 2
  [
    "https://www.meetup.com/fr-FR/Meetup-HarryCow-coworking-Toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/cercle-dambition-morale/events/ical/",
    "https://www.meetup.com/fr-FR/crea-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/art-lovers-art-events/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-pause-cafe-sprituelle/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-recommended-boardgames-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/soirees-cine-philo/events/ical/",
    "https://www.meetup.com/fr-FR/rotary-toulouse-ovalie/events/ical/",
    "https://www.meetup.com/fr-FR/the_art_of_noticing_toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/cafe-das-maes/events/ical/",
    "https://www.meetup.com/fr-FR/frenchproduit-sudouest-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/franglish-improv-club/events/ical/"
    ],
  // Lot 3
  [
    "https://www.meetup.com/fr-FR/the-friendly-debate/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-sociale-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/colocation-logement-hebergement-emploi-job-stage-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-sorties-evenements-soirees-balades-visites-randos/events/ical/",
    "https://www.meetup.com/fr-FR/expats-in-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-free-evenements-to-discover/events/ical/",
    "https://www.meetup.com/fr-FR/meetup-group-iozolhsj/events/ical/",
    "https://www.meetup.com/fr-FR/international-mondays-tower-of-london/events/ical/",
    "https://www.meetup.com/fr-FR/Yellow-Chatters-Toulouse-International-Community/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-hiking-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/rando-entre-femmes-nature-convivialite/events/ical/"
  ],
  // Lot 4
  [
    "https://www.meetup.com/fr-FR/meetup-group-pdfpdjis/events/ical/",
    "https://www.meetup.com/fr-FR/friday-night-live-fnl/events/ical/",
    "https://www.meetup.com/fr-FR/la-sauce-viens-relever-ta-creativite-au-sol-entre-meufs/events/ical/",
    "https://www.meetup.com/fr-FR/contesatoulouse/events/ical/",
    "https://www.meetup.com/fr-FR/groupe-meetup-toulouse-philosophie/events/ical/",
    "https://www.meetup.com/fr-FR/el-patio-lab/events/ical/",
    "https://www.meetup.com/fr-FR/danse-flamenco/events/ical/",
    "https://www.meetup.com/fr-FR/danses-traditionnelles-indiennes-a-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/pages-n-pies/events/ical/",
    "https://www.meetup.com/fr-FR/se-faire-des-amis-en-randonnant-%EF%B8%8F/events/ical/"
  ],
  // Lot 5
  [
    "https://www.meetup.com/fr-FR/studio-video-photo-podcast-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/le-club-des-curieux/events/ical/",
    "https://www.meetup.com/fr-FR/occitania-hikes/events/ical/",
    "https://www.meetup.com/fr-FR/Toulouse-travel-photography/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-petanque/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-viajes-aventura-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/meetup-group-ogveclmn/events/ical/",
    "https://www.meetup.com/fr-FR/Gnosis-Toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/The-Freedom-Trail-Trek-Meetup/events/ical/",
    "https://www.meetup.com/pages-n-pies/events/ical/"
  ],
    // Lot 6
  [
    "https://www.meetup.com/femmes-sensibles-solidaires-toulouse/events/ical/",
    "https://www.meetup.com/myapero-toulouse/events/ical/",
    "https://www.meetup.com/conscience-spiritualite-toulouse/events/ical/",
    "https://www.meetup.com/happy-nouvelle-vie/events/ical/",
    "https://www.meetup.com/cercle-dambition-morale/events/ical/",
    "https://www.meetup.com/malaia-collective-yoga-movement-intentional-living/events/ical/",
    "https://www.meetup.com/pages-n-pals/events/ical/",
    "https://www.meetup.com/cercle-de-femme-et-art-therapie-toulouse/events/ical/",
    "https://www.meetup.com/crea-toulouse/events/ical/",
    "https://www.meetup.com/toulouse-sociale-meetup-group/events/ical/"
  ],
      // Lot 7
  [
    "https://www.meetup.com/la-sauce-viens-relever-ta-creativite-au-sol-entre-meufs/events/ical/",
    "https://www.meetup.com/star-wars-imperial-assault-in-toulouse/events/ical/",
    "https://www.meetup.com/toulouse-women-personal-development-meetup-group/events/ical/",
    "https://www.meetup.com/bring-me-the-horizon-occitanie/events/ical/",
    "https://www.meetup.com/les-grognards-de-la-marne/events/ical/",
    "https://www.meetup.com/scene-ouverte-chant-piano-guitare/events/ical/"
    ]
];

// --- Types ---
type MeetupEventItem = {
  title: string;
  link: string;
  startDate: string;
  location: string;
  fullAddress: string;
  description: string;
  coverImage?: string;
};

// --- Scraping ---
async function scrapeEventData(url: string): Promise<{ coverImage?: string; fullAddress?: string }> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr('content');
    let fullAddress: string | undefined;

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const data = JSON.parse($(elem).html() || '');
        if (data['@type'] === 'Event') {
          const addr = data.location?.address;
          if (addr?.streetAddress) {
            fullAddress = `${addr.streetAddress}, ${addr.addressLocality || ''}`.trim().replace(/,$/, '');
          }
        }
      } catch {}
    });
    return { coverImage: ogImage, fullAddress };
  } catch { return {}; }
}

// --- Fetcher un Lot ---
async function fetchLot(lot: string[]): Promise<MeetupEventItem[]> {
  const allCalendars = await Promise.allSettled(lot.map(async url => {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return ical.parseICS(await res.text());
  }));

  const uniqueMap = new Map<string, VEvent>();
  allCalendars.forEach(result => {
    if (result.status === 'fulfilled') {
      const calendar = result.value;
      for (const key in calendar) {
        const event = calendar[key] as VEvent;
        if (event.type === 'VEVENT' && event.start) {
          const id = event.uid || (event.summary + event.start.toISOString());
          uniqueMap.set(id, event);
        }
      }
    }
  });

  const events = Array.from(uniqueMap.values());
  return await Promise.all(events.map(async e => {
    let url = typeof e.url === "string" ? e.url : (e.url as any)?.val;
    if (!url && e.uid) url = `https://www.meetup.com/fr-FR/events/${e.uid}/`;
    
    const extra = url ? await scrapeEventData(url) : {};
    const finalAddress = (e.location || extra.fullAddress || "Lieu non spécifié").trim();

    return {
      title: e.summary || "Événement sans titre",
      link: url || "",
      startDate: e.start.toISOString(),
      location: finalAddress.split(',')[0],
      fullAddress: finalAddress,
      description: String(e.description || ""),
      coverImage: extra.coverImage,
    };
  }));
}

// --- Route API ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lotParam = searchParams.get('lot');
  const getAll = searchParams.get('all') === 'true';

  try {
    let finalEvents: MeetupEventItem[] = [];
    let nextLot: number | null = null;

    if (getAll) {
      // Pour meetup-full : on récupère tout (lent mais complet)
      const allResults = await Promise.all(ICAL_GROUPS.map(lot => fetchLot(lot)));
      finalEvents = allResults.flat();
    } else {
      // Pour Solution B : on récupère lot par lot
      const index = parseInt(lotParam || '0');
      if (index >= 0 && index < ICAL_GROUPS.length) {
        finalEvents = await fetchLot(ICAL_GROUPS[index]);
        nextLot = index + 1 < ICAL_GROUPS.length ? index + 1 : null;
      }
    }

    // Filtrage dates futures + tri
    const now = new Date();
    const endFilter = new Date(now.getTime() + 31 * 86400000);
    
    const filtered = finalEvents
      .filter(e => {
        const d = new Date(e.startDate);
        return d >= now && d < endFilter;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json({ 
      events: filtered, 
      nextLot, 
      totalLots: ICAL_GROUPS.length 
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' }
    });

  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur", events: [] }, { status: 500 });
  }
}
