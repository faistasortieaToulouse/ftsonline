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
 * Formate la date actuelle au format RSS (RFC 2822) avec l'heure fixée à 00:00:00 GMT.
 */
function formatTodayDateAtMidnight(): string {
    const now = new Date();
    // Crée une nouvelle date pour aujourd'hui, mais avec l'heure, minute, seconde, milliseconde
    // mises à zéro (minuit) dans le fuseau horaire UTC.
    const todayMidnightUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
    
    // Utilise toUTCString() pour obtenir le format compatible RSS/RFC 2822
    return todayMidnightUtc.toUTCString();
}

/**
 * Obtient le temps Unix de minuit UTC pour une comparaison précise de la date seule.
 */
function getTodayMidnightTimestamp(): number {
    const now = new Date();
    const todayMidnightUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
    return todayMidnightUtc.getTime();
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
    const todayMidnightRss = formatTodayDateAtMidnight();
    const todayMidnightTimestamp = getTodayMidnightTimestamp();

    const itemsWithCategories = arr.map((item: any) => {
      let { pubDate } = item;
      
      // 1. Convertir la date de l'item en objet Date
      const itemDate = new Date(pubDate);

      // 2. Créer un timestamp de l'item avec l'heure mise à zéro
      // Ceci permet une comparaison jour par jour, ignorant l'heure.
      let itemDateTimestamp = itemDate.getTime();
      
      // La comparaison doit être faite contre l'heure de l'événement et non l'heure de publication. 
      // Si on veut vraiment comparer la date passée par rapport à AUJOURD'HUI.
      // S'assurer que le champ pubDate du flux RSS est bien la date de l'événement et non la date de publication.
      
      if (itemDate.toString() !== "Invalid Date") {
        // Obtenir le timestamp de la date de l'item à minuit (pour comparaison jour par jour)
        const itemDateAtMidnight = new Date(Date.UTC(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate(), 0, 0, 0));
        itemDateTimestamp = itemDateAtMidnight.getTime();
      }
      

      // 3. Vérifier si la date de l'item (à minuit) est strictement antérieure à minuit aujourd'hui
      if (itemDate.toString() !== "Invalid Date" && itemDateTimestamp < todayMidnightTimestamp) {
        console.log(`[DATE REMPLACÉE] Ancienne date: ${pubDate} (Timestamp: ${itemDateTimestamp}) -> Nouvelle date: ${todayMidnightRss}`);
        // Remplacer la date si elle est dépassée
        pubDate = todayMidnightRss;
      }
      
      const category = detectCategory(item.title, item.description);
      const image = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["Défaut"];

      return {
        title: item.title,
        link: item.link,
        pubDate, // Utilise la date potentiellement modifiée (avec l'heure fixée)
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
