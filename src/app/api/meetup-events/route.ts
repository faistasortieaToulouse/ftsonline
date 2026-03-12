import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import ical from 'ical';

// --- Configuration des Flux ---
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
    "https://www.meetup.com/fr-FR/toulouse-free-evenements-to-discover/events/ical/",
    "https://www.meetup.com/fr-FR/meetup-group-iozolhsj/events/ical/",
    "https://www.meetup.com/fr-FR/international-mondays-tower-of-london/events/ical/",
    "https://www.meetup.com/fr-FR/Yellow-Chatters-Toulouse-International-Community/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-hiking-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/rando-entre-femmes-nature-convivialite/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-crossfit-et-paleo-meetup/events/ical/",
    "https://www.meetup.com/fr-FR/cercle-de-femmes-toulouse-centre/events/ical/",
    "https://www.meetup.com/fr-FR/la-melee-toulouse/events/ical/"
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
    "https://www.meetup.com/fr-FR/The-Freedom-Trail-Trek-Meetup/events/ical/"
  ],
  // Lot 6
  [
    "https://www.meetup.com/fr-FR/femmes-sensibles-solidaires-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/myapero-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/conscience-spiritualite-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/happy-nouvelle-vie/events/ical/",
    "https://www.meetup.com/fr-FR/malaia-collective-yoga-movement-intentional-living/events/ical/",
    "https://www.meetup.com/fr-FR/pages-n-pals/events/ical/",
    "https://www.meetup.com/fr-FR/cercle-de-femme-et-art-therapie-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/hygienisme-hormese-et-vitalite-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/le-flow-lab-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/meetup-des-organisateurs-de-toulouse/events/ical/"
  ],
  // Lot 7
  [
    "https://www.meetup.com/fr-FR/star-wars-imperial-assault-in-toulouse/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-women-personal-development-meetup-group/events/ical/",
    "https://www.meetup.com/fr-FR/bring-me-the-horizon-occitanie/events/ical/",
    "https://www.meetup.com/fr-FR/les-grognards-de-la-marne/events/ical/",
    "https://www.meetup.com/fr-FR/toulouse-speakers-toastmasters-club/events/ical/",
    "https://www.meetup.com/fr-FR/scene-ouverte-chant-piano-guitare/events/ical/",
    "https://www.meetup.com/fr-FR/artilect-fablab/events/ical/",
    "https://www.meetup.com/fr-FR/the-purpose-circle/events/ical/",
    "https://www.meetup.com/fr-FR/partage-autour-de-lagilite/events/ical/"
  ]
];

// Nettoie l'URL pour éviter les doublons de langue et de slash
const normalizeUrl = (url: string) => {
  return url
    .replace(/https:\/\/www\.meetup\.com\/(?:[a-z]{2}-[A-Z]{2}\/)?/, 'https://www.meetup.com/')
    .split('?')[0] // Supprime les paramètres de suivi
    .replace(/\/$/, ''); // Supprime le slash final
};

async function scrapeEventData(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return {};
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let coverImage = $('meta[property="og:image"]').attr('content');
    let fullAddress: string | undefined;

    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const data = JSON.parse($(elem).html() || '');
        const event = Array.isArray(data) ? data.find(i => i['@type'] === 'Event') : data;
        if (event && event['@type'] === 'Event') {
          if (!coverImage && event.image) coverImage = Array.isArray(event.image) ? event.image[0] : event.image;
          const addr = event.location?.address;
          if (addr?.streetAddress) fullAddress = `${addr.streetAddress}, ${addr.addressLocality || ''}`.trim();
        }
      } catch {}
    });
    return { coverImage, fullAddress };
  } catch { return {}; }
}

async function fetchLot(lot: string[]) {
  const allCalendars = await Promise.allSettled(lot.map(async url => {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return ical.parseICS(await res.text());
  }));

  const rawEvents: any[] = [];
  allCalendars.forEach(result => {
    if (result.status === 'fulfilled') {
      const calendar = result.value;
      for (const key in calendar) {
        const event = calendar[key];
        if (event.type === 'VEVENT' && event.start) rawEvents.push(event);
      }
    }
  });

  // --- ÉTAPE 1 : Dédoublonnage AVANT le scraping ---
  const uniqueEventsMap = new Map();
  rawEvents.forEach(e => {
    const title = (e.summary || "").trim().toLowerCase();
    const date = e.start.toISOString();
    const key = `${title}-${date}`; // Clé unique par titre + date

    if (!uniqueEventsMap.has(key)) {
      uniqueEventsMap.set(key, e);
    }
  });

  const uniqueEvents = Array.from(uniqueEventsMap.values());

  // --- ÉTAPE 2 : Scraping des données uniquement pour les uniques ---
  return await Promise.all(uniqueEvents.map(async e => {
    let rawUrl = typeof e.url === "string" ? e.url : e.url?.val;
    if (!rawUrl && e.uid) rawUrl = `https://www.meetup.com/events/${e.uid.split('@')[0]}/`;
    
    const url = rawUrl ? normalizeUrl(rawUrl) : "";
    const extra = url ? await scrapeEventData(url) : {};
    const finalAddress = (e.location || extra.fullAddress || "Lieu non spécifié").trim();

    return {
      title: e.summary || "Événement sans titre",
      link: url,
      startDate: e.start.toISOString(),
      location: finalAddress.split(',')[0],
      fullAddress: finalAddress,
      description: String(e.description || "").replace(/\\n/g, '\n'),
      coverImage: extra.coverImage || null,
    };
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lotIndex = parseInt(searchParams.get('lot') || '0');

  try {
    if (lotIndex < 0 || lotIndex >= ICAL_GROUPS.length) {
      return NextResponse.json({ events: [], nextLot: null });
    }

    const events = await fetchLot(ICAL_GROUPS[lotIndex]);

    const now = new Date();
    const endFilter = new Date(now.getTime() + 31 * 86400000); // 31 jours
    
    const filtered = events
      .filter(e => {
        const d = new Date(e.startDate);
        return d >= now && d < endFilter;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json({ 
      events: filtered, 
      nextLot: lotIndex + 1 < ICAL_GROUPS.length ? lotIndex + 1 : null,
      totalLots: ICAL_GROUPS.length 
    });

  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur", events: [] }, { status: 500 });
  }
}
