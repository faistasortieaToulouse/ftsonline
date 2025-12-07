import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // IMPORTANT SUR NETLIFY

// ------------------------------
// UTILITAIRES DE DÉTECTION ET DE DATE
// ------------------------------
function detectEncoding(xmlBuffer: Uint8Array): string {
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));
  const match = ascii.match(/encoding=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? "utf-8";
}

// Retourne la date UTC de minuit pour un jour donné
function getMidnightUtc(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
}

// Retourne le timestamp de minuit UTC pour un jour donné
function getMidnightTimestamp(date: Date): number {
  return getMidnightUtc(date).getTime();
}

// Retourne la date UTC formatée en RFC 2822 (compatible RSS)
function formatRfc2822(date: Date): string {
  return date.toUTCString();
}

// ------------------------------
// CATÉGORIES ET IMAGES
// ------------------------------
const CATEGORY_IMAGES: Record<string, string> = {
  "Concert": "/images/agenda31/agendconcert.jpg",
  "Théâtre": "/images/agenda31/agendtheatre.jpg",
  "Festival": "/images/agenda31/agendfestival.jpg",
  "Jeune public": "/images/agenda31/agendspectacleenfants.jpg",
  "Danse": "/images/agenda31/agenddanse.jpg",
  "Arts du spectacle": "/images/agenda31/agendartspectacle.jpg",
  "Exposition": "/images/agenda31/agendexpo.jpg",
  "Défaut": "/images/agenda31/agendgenerique.jpg",
};

function detectCategory(title: string = "", description: string = ""): string {
  const text = (title + " " + description).toLowerCase();

  if (text.includes("concert")) return "Concert";
  if (text.includes("théâtre") || text.includes("theatre")) return "Théâtre";
  if (text.includes("festival")) return "Festival";
  if (text.includes("jeune public") || text.includes("enfant")) return "Jeune public";
  if (text.includes("danse")) return "Danse";
  if (text.includes("spectacle")) return "Arts du spectacle";
  if (text.includes("expo") || text.includes("exposition")) return "Exposition";

  return "Défaut";
}

// ------------------------------
// ROUTE API
// ------------------------------
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

    const todayMidnightTimestamp = getMidnightTimestamp(new Date());

    const itemsWithCategories = arr.map((item: any) => {
      let { pubDate } = item;
      let itemDate = new Date(pubDate);

      if (itemDate.toString() !== "Invalid Date") {
        const itemDateTimestamp = getMidnightTimestamp(itemDate);

        // Si la date est passée, on remplace par demain à minuit
        if (itemDateTimestamp < todayMidnightTimestamp) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowMidnight = getMidnightUtc(tomorrow);
          console.log(`[DATE REMPLACÉE] Ancienne date: ${pubDate} -> Nouvelle date: ${tomorrowMidnight.toUTCString()}`);
          pubDate = formatRfc2822(tomorrowMidnight);
        }
      }

      const category = detectCategory(item.title, item.description);
      const image = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Défaut"];

      return {
        title: item.title,
        link: item.link,
        pubDate,
        description: item.description,
        category,
        image,
      };
    });

    return NextResponse.json({ items: itemsWithCategories });
  } catch (err: any) {
    return NextResponse.json(
      { items: [], error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
