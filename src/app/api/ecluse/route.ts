// app/api/utopia/route.ts
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

export async function GET(req: Request) {
  const feedUrl = 'https://www.cinemas-utopia.org/toulouse/?feed=rss2';

  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Next.js – RSS Fetcher' },
    });

    if (!res.ok) return NextResponse.json({ items: [] }, { status: res.status });

    // Lire le flux en ArrayBuffer
    const arrayBuffer = await res.arrayBuffer();

    // Décoder explicitement en UTF-8
    const decoder = new TextDecoder("utf-8");
    const xml = decoder.decode(arrayBuffer);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });

    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
    }));

    return NextResponse.json({ items: feedItems });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ items: [], error: 'Impossible de récupérer le flux RSS' }, { status: 500 });
  }
}
