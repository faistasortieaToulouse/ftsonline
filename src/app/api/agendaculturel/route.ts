// app/api/agendaculturel/route.ts
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";

// Détection automatique de l'encodage
function detectEncoding(xmlBuffer: Uint8Array): string {
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));
  const match = ascii.match(/encoding=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? "utf-8";
}

// Extraction d’une URL d’image dans la description HTML
function extractImageFromDescription(desc: string): string | null {
  if (!desc) return null;

  // match du premier <img src="...">
  const match = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export async function GET() {
  const feedUrl = "https://31.agendaculturel.fr/rss/concert/toulouse/";

  try {
    const res = await fetch(feedUrl, {
      cache: "no-store",
      headers: { "User-Agent": "Next.js – RSS Fetcher" },
    });

    if (!res.ok) {
      console.error("HTTP error :", res.status);
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const encoding = detectEncoding(uint8);
    const xml = new TextDecoder(encoding).decode(uint8);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const parsed = parser.parse(xml);
    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any) => {
      const description = item.description ?? "";
      const image = extractImageFromDescription(description);

      return {
        title: item.title ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
        description,
        image, // <-- ajout
      };
    });

    return NextResponse.json({ items: feedItems });
  } catch (err) {
    console.error("RSS ERROR :", err);
    return NextResponse.json(
      { items: [], error: "Impossible de récupérer le flux RSS" },
      { status: 500 }
    );
  }
}
