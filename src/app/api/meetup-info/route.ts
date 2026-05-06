import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import ical from 'ical';

// --- Configuration des Flux ---
const ICAL_GROUPS: string[][] = [
  // Lot 1
[
  "https://www.meetup.com/fr-FR/javascript-and-co/events/ical/",
  "https://www.meetup.com/fr-FR/mug-toulouse-mobile-user-group/events/ical/",
  "https://www.meetup.com/fr-FR/wptoulouse/events/ical/",
  "https://www.meetup.com/fr-FR/wocsa-ethical-hacking-workshop-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/mtg-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/rust-community-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-logiciel-libre/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-ruby-friends/events/ical/",
  "https://www.meetup.com/fr-FR/afup-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-java-user-group/events/ical/",
  "https://www.meetup.com/fr-FR/postgres-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/python-toulouse/events/ical/"
],
  // Lot 2
[
  "https://www.meetup.com/fr-FR/les-bricodeurs-a-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/nocode-toulouse-ia/events/ical/",
  "https://www.meetup.com/fr-FR/la-melee-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/ocaml-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/meetupdev-by-iot-valley/events/ical/",
  "https://www.meetup.com/fr-FR/swift-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/ateliers-cpp-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/ia-innovateurs/events/ical/",
  "https://www.meetup.com/fr-FR/web-atrio-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-atlassian-community-events/events/ical/",
  "https://www.meetup.com/fr-FR/meetup-visualisation-des-donnees-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/tlse-data-science/events/ical/"
],
  // Lot 3
[
  "https://www.meetup.com/fr-FR/toulouse-blender-user-group/events/ical/",
  "https://www.meetup.com/fr-FR/meetup-iot-valley/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-web-development-meetup-group/events/ical/",
  "https://www.meetup.com/fr-FR/ludigeeks-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/data-for-good-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-urban-sketch-class/events/ical/",
  "https://www.meetup.com/fr-FR/ai-and-society-meetup-group/events/ical/",
  "https://www.meetup.com/fr-FR/evenements-de-onepoint-a-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-new-technology-meetup-group/events/ical/",
  "https://www.meetup.com/fr-FR/myapero-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/podtoulouse/events/ical/",
  "https://www.meetup.com/fr-FR/tuxedo-toulouse-ux-events-and-design-organisation/events/ical/"
],
  // Lot 4
[
  "https://www.meetup.com/fr-FR/masterclass-waves-lv1-mixer-et-waves-sg-connect/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-amazon-web-services/events/ical/",
  "https://www.meetup.com/fr-FR/ethereum-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/edtech-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/cloud-native-computing-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/meetup-ovhcloud-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/monkeytechdays/events/ical/",
  "https://www.meetup.com/fr-FR/tech-a-break/events/ical/",
  "https://www.meetup.com/fr-FR/entrepreneurs-independants-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/entreprendre-dans-linformatique/events/ical/",
  "https://www.meetup.com/fr-FR/reseau-freelances-it-ingenierie-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/meetup-freelance-toulouse/events/ical/"
],
  // Lot 5
[
  "https://www.meetup.com/fr-FR/entrepreneurs-toulousains/events/ical/",
  "https://www.meetup.com/fr-FR/freelance-toulouse-nouvelles-technologies/events/ical/",
  "https://www.meetup.com/fr-FR/entrepriserie-oceanbleu/events/ical/",
  "https://www.meetup.com/fr-FR/talk-entrepreneurs/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-entrepreneur/events/ical/",
  "https://www.meetup.com/fr-FR/reseautage-en-direct-entrepreneurs-pros-france/events/ical/",
  "https://www.meetup.com/fr-FR/dozer-asso/events/ical/",
  "https://www.meetup.com/fr-FR/bootcamp-femme-entrepreneuses/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-growth-lab/events/ical/",
  "https://www.meetup.com/fr-FR/twitlse/events/ical/",
  "https://www.meetup.com/fr-FR/groupe-meetup-ippeventtoulouse/events/ical/",
  "https://www.meetup.com/fr-FR/leev-labs-gestion-de-projet-et-product-management/events/ical/"
],
  // Lot 6
[
  "https://www.meetup.com/fr-FR/leaderschool/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-women-personal-development-meetup-group/events/ical/",
  "https://www.meetup.com/fr-FR/revelersonpotentiel/events/ical/",
  "https://www.meetup.com/fr-FR/happy-nouvelle-vie/events/ical/",
  "https://www.meetup.com/fr-FR/personal-development-for-rational-minds-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/zen-singing-circle/events/ical/",
  "https://www.meetup.com/fr-FR/gnosis-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/se-reconnecter-a-soi-ateliers-en-ligne/events/ical/",
  "https://www.meetup.com/fr-FR/toulousebusinessexchange/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-bitcoin/events/ical/",
  "https://www.meetup.com/fr-FR/noma-cafe-coworking/events/ical/",
  "https://www.meetup.com/fr-FR/toulouse-bitcoin-meetup/events/ical/"
],
  // Lot 7
[
  "https://www.meetup.com/fr-FR/evenement-toulouse-multiplier-vos-revenus-en-2024/events/ical/",
  "https://www.meetup.com/fr-FR/neptune-business-club/events/ical/",
  "https://www.meetup.com/fr-FR/investisseurs-en-bourse-toulousains/events/ical/",
  "https://www.meetup.com/fr-FR/cryptomonnaie-fun-decouvrez-ionet/events/ical/",
  "https://www.meetup.com/toulouse-audio-engineering-meetup-group/events/ical/",
  "https://www.meetup.com/toulouse-web-development-meetup-group/events/ical/",
  "https://www.meetup.com/web-atrio-toulouse/events/ical/",
  "https://www.meetup.com/sfeir-toulouse/events/ical/",
  "https://www.meetup.com/fr-FR/mach-africa-insights-marketing-strategie-finance/events/ical/"
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
