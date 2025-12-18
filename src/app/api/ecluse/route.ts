import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { JSDOM } from 'jsdom';

export async function GET() {
  const feedUrl = 'https://www.ecluse-prod.com/category/agenda/feed/';
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Next.js – RSS Fetcher' } });
    if (!res.ok) return NextResponse.json({ items: [] }, { status: res.status });

    const text = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const parsed = parser.parse(text);
    const items = parsed?.rss?.channel?.item;
    if (!items) return NextResponse.json({ items: [] });

    // On prend le premier item (tout le calendrier)
    const content = items[0]['content:encoded'] ?? '';
    const dom = new JSDOM(content);
    const document = dom.window.document;

    const events: any[] = [];
    document.querySelectorAll('ul li').forEach((li) => {
      const text = li.textContent?.trim() ?? '';
      // Filtre uniquement Haute-Garonne (31) ou Toulouse
      if (!text.includes('(31)') && !text.toLowerCase().includes('toulouse')) return;

      // Exemple : "Mer 31 déc à 19h : Le 11/11/11 à 11h11… (Cie 11h11) – Théâtre du Grand Rond, TOULOUSE (31)**"
      const [datePart, rest] = text.split(' : ');
      if (!rest) return;

      const [titlePart, locationPart] = rest.split(' – ');
      const title = titlePart.replace(/^\s*<em>|<\/em>\s*$/g, '').trim() || titlePart.trim();
      const description = titlePart.includes('(') ? titlePart.match(/\((.+)\)/)?.[1] ?? '' : '';
      const location = locationPart?.trim() ?? '';

      // Date (approximation, pour build ISO)
      const isoDate = new Date(`${datePart} 2025`).toISOString(); // année fixe car non fournie

      events.push({
        title,
        description,
        location,
        date: isoDate,
        image: 'https://via.placeholder.com/400x200?text=L\'Écluse',
        url: '', // pas de lien direct vers l'événement
      });
    });

    return NextResponse.json({ items: events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ items: [], error: 'Impossible de récupérer le flux RSS' }, { status: 500 });
  }
}
