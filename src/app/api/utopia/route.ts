import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const feedUrl = 'https://www.cinemas-utopia.org/toulouse/?feed=rss2';

  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }, // user-agent classique
    });

    if (!res.ok) return NextResponse.json({ items: [] }, { status: res.status });

    const xml = await res.text();

    // Tester si c'est vraiment du XML
    if (!xml.startsWith('<?xml') && !xml.includes('<rss')) {
      console.error('Le flux récupéré n’est pas du XML', xml.slice(0, 200));
      return NextResponse.json({ items: [], error: 'Flux RSS invalide' }, { status: 500 });
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      allowBooleanAttributes: true,
      parseTagValue: true,
    });

    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item;
    const arr = Array.isArray(items) ? items : items ? [items] : [];

    const feedItems = arr.map((item: any, idx: number) => ({
      id: idx,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      source: "Utopia Borderouge",
    }));

    return NextResponse.json({ items: feedItems });
  } catch (err) {
    console.error("Erreur API Utopia :", err);
    return NextResponse.json({ items: [], error: "Impossible de récupérer le flux RSS" }, { status: 500 });
  }
}
