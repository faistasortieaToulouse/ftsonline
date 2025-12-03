import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // IMPORTANT SUR NETLIFY

/**
 * Détecte l'encodage à partir du début du buffer XML.
 */
function detectEncoding(xmlBuffer: Uint8Array): string {
  const ascii = new TextDecoder("ascii").decode(xmlBuffer.slice(0, 200));
  const match = ascii.match(/encoding=["']([^"']+)["']/i);
  return match?.[1]?.toLowerCase() ?? "utf-8";
}

// ------------------------------
// Catégories supportées
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

/**
 * Détecte la catégorie basée sur le titre et la description.
 */
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

/**
 * Formate la date actuelle au format des dates de flux RSS (ex: "Wed, 03 Dec 2025 08:00:00 GMT").
 */
function formatTodayDateForRss(): string {
    // Utilise toUTCString() pour obtenir un format compatible RSS/RFC 2822
    // Le fuseau horaire sera GMT, ce qui est acceptable pour remplacer une ancienne date.
    return new Date().toUTCString();
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

    // --- LOGIQUE DE VÉRIFICATION ET DE REMPLACEMENT DE DATE ---
    const todayDateRss = formatTodayDateForRss();
    const todayTimestamp = new Date().getTime();

    const itemsWithCategories = arr.map((item: any) => {
      let { pubDate } = item;
      
      // 1. Convertir la date de l'item en objet Date
      const itemDate = new Date(pubDate);

      // 2. Vérifier si la date est valide et antérieure à aujourd'hui
      if (itemDate.toString() !== "Invalid Date" && itemDate.getTime() < todayTimestamp) {
        console.log(`[DATE REMPLACÉE] Ancienne date: ${pubDate} -> Nouvelle date: ${todayDateRss}`);
        // Remplacer la date si elle est dépassée
        pubDate = todayDateRss;
      }
      
      const category = detectCategory(item.title, item.description);
      const image = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Défaut"];

      return {
        title: item.title,
        link: item.link,
        pubDate, // Utilise la date potentiellement modifiée
        description: item.description,
        category,
        image,
      };
    });
    // --- FIN LOGIQUE DE VÉRIFICATION ET DE REMPLACEMENT DE DATE ---

    return NextResponse.json({ items: itemsWithCategories });

  } catch (err: any) {
    return NextResponse.json(
      { items: [], error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
