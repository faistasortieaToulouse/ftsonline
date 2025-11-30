// src/app/api/abc/route.ts
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  const feedUrl = "https://abc-toulouse.fr/feed/";

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "Next.js - RSS Fetcher" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const xml = await res.text(); // Texte brut

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any, idx: number) => ({
      id: idx,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
      source: "Cinéma ABC",
    }));

    return NextResponse.json({ items: feedItems });
  } catch (err) {
    console.error("Erreur API Cinéma ABC :", err);
    return NextResponse.json(
      { items: [], error: "Impossible de récupérer le flux RSS" },
      { status: 500 }
    );
  }
}
