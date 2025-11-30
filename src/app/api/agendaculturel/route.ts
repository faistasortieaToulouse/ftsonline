// app/api/agendaculturel/route.ts
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";

/** Détection automatique de l'encodage dans la déclaration XML */
function detectEncoding(xmlBuffer: Uint8Array): string {
  // Décodage minimal en ASCII pour lire la balise xml
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));

  // Exemple : <?xml version="1.0" encoding="UTF-8"?>
  const match = ascii.match(/encoding=["']([^"']+)["']/i);

  if (match && match[1]) {
    return match[1].toLowerCase();
  }

  // Aucun encoding trouvé → UTF-8 par défaut
  return "utf-8";
}

export async function GET() {
  const feedUrl = "https://31.agendaculturel.fr/rss/concert/toulouse/";

  try {
    const res = await fetch(feedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Next.js – RSS Fetcher",
      },
    });

    if (!res.ok) {
      console.error("HTTP error :", res.status);
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // 1️⃣ Détecter automatiquement l'encodage
    const encoding = detectEncoding(uint8);

    // 2️⃣ Décoder le flux avec le bon encodage
    const decoder = new TextDecoder(encoding);
    const xml = decoder.decode(uint8);

    // 3️⃣ Parser le XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const parsed = parser.parse(xml);

    const items = parsed?.rss?.channel?.item ?? [];
    const arr = Array.isArray(items) ? items : [items];

    const feedItems = arr.map((item: any) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      pubDate: item.pubDate ?? "",
      description: item.description ?? "",
    }));

    return NextResponse.json({ items: feedItems });
  } catch (err) {
    console.error("RSS ERROR :", err);
    return NextResponse.json(
      { items: [], error: "Impossible de récupérer le flux RSS" },
      { status: 500 }
    );
  }
}
