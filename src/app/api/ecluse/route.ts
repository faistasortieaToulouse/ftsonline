// app/api/ecluse/route.ts
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  const feedUrl = "https://www.ecluse-prod.com/category/agenda/feed/";

  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Next.js RSS Fetcher)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      removeNSPrefix: true,
    });

    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any) => ({
      id: item.guid?.["#text"] || item.guid || item.link,
      title: item.title,
      link: item.link,
      date: item.pubDate,
      description: item.description,
      source: "L'Écluse",
      categories: ["L'Écluse"],
    }));

    return NextResponse.json({ total: feedItems.length, items: feedItems });
  } catch (err) {
    console.error("Erreur RSS L'Écluse :", err);
    return NextResponse.json(
      { items: [], error: "Impossible de récupérer le flux RSS L'Écluse" },
      { status: 500 }
    );
  }
}
