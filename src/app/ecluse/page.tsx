// src/app/api/ecluse/route.ts
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { JSDOM } from 'jsdom';

export async function GET() {
  const feedUrl = 'https://www.ecluse-prod.com/category/agenda/feed/';

  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'Next.js – RSS Fetcher' } });
    if (!res.ok) return NextResponse.json({ events: [] }, { status: res.status });

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const parsed = parser.parse(xml);
    const item = parsed?.rss?.channel?.item;

    if (!item) return NextResponse.json({ events: [] });

    // Le flux contient tout dans content:encoded
    const html = item['content:encoded'];
    if (!html) return NextResponse.json({ events: [] });

    const dom = new JSDOM(html);
    const document = dom.window.document;
    const lis = Array.from(document.querySelectorAll('ul li'));

    const today = new Date();
    today.setHours(0,0,0,0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 31);

    const events = lis
      .map(li => {
        const text = li.textContent?.trim();
        if (!text) return null;

        // Ex: "Mer 31 déc à 19h : Le 11/11/11 à 11h11… (Cie 11h11) – Théâtre du Grand Rond, TOULOUSE (31)**"
        const dateMatch = text.match(/([A-Za-z]+ \d{1,2} [a-z]+) à (\d{1,2}h\d{0,2})/i);
        if (!dateMatch) return null;

        const [_, dateStr, hourStr] = dateMatch;

        // construire date
        const yearMatch = html.match(/SAISON (\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : today.getFullYear();
        const months: Record<string, number> = {
          janv:0, fév:1, mars:2, avril:3, mai:4, juin:5,
          juil:6, août:7, sept:8, oct:9, nov:10, déc:11
        };
        const [dayStr, monthStr] = dateStr.split(' ').slice(1); // ex: "31 déc"
        const day = parseInt(dayStr, 10);
        const month = months[monthStr.toLowerCase()] ?? 0;

        const [hour, min] = hourStr.split('h').map(n=>parseInt(n,10));
        const eventDate = new Date(year, month, day, hour, min||0);
        if (isNaN(eventDate.getTime())) return null;
        if (eventDate < today || eventDate > maxDate) return null;

        // filtrer Haute-Garonne
        if (!text.includes('31') && !text.toUpperCase().includes('TOULOUSE')) return null;

        // extraire title et lieu
        const parts = text.split('–');
        const title = parts[0]?.split(':').slice(1).join(':').trim() || text;
        const location = parts[1]?.trim() || '';

        return {
          title,
          description: text,
          date: eventDate.toISOString(),
          location,
          link: item.link,
          image: title.toLowerCase().includes('spectacle') ? 'https://via.placeholder.com/400x200?text=Spectacle' : 'https://via.placeholder.com/400x200?text=L\'Écluse',
          source: "L'Écluse",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ events: [], error: 'Impossible de récupérer le flux RSS' }, { status: 500 });
  }
}
