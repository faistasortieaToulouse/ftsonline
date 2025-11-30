import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";  // IMPORTANT SUR NETLIFY

function detectEncoding(xmlBuffer: Uint8Array): string {
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));
  const match = ascii.match(/encoding=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? "utf-8";
}

async function fetchEventImage(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return "https://via.placeholder.com/400x200?text=Agenda+Culturel";

    const html = await res.text();
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];

    return "https://via.placeholder.com/400x200?text=Agenda+Culturel";
  } catch {
    return "https://via.placeholder.com/400x200?text=Agenda+Culturel";
  }
}

export async function GET() {
  const feedUrl = "https://31.agendaculturel.fr/rss/concert/toulouse/";

  try {
    const res = await fetch(feedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://google.com/bot.html)",
        "Accept": "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        "Referer": "https://ftsonline.netlify.app/"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ items: [], status: res.status }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const encoding = detectEncoding(uint8);
    const xml = new TextDecoder(encoding).decode(uint8);

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const itemsWithImages = await Promise.all(arr.map(async (item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      image: await fetchEventImage(item.link),
    })));

    return NextResponse.json({ items: itemsWithImages });

  } catch (err: any) {
    return NextResponse.json(
      { items: [], error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
