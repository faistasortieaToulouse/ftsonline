import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

// --- Définition des types et des événements ---

type RawItem = Parser.Item;

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;        // date ISO (publication date)
  end: string | null;   
  location: string | null;
  image: string | null;
  url: string;
  source: string; // Champ clé pour identifier l'origine
}

// --- Configuration des Flux RSS ---

/**
 * Liste des URLs de flux RSS à interroger.
 * Chaque objet inclut l'URL et le nom de la source associé.
 */
const RSS_CONFIGS = [
  {
    url: "https://www.canal-u.tv/chaines/univ_toulouse/rss",
    sourceName: "Université de Toulouse (UT)",
  },
  {
    url: "https://www.canal-u.tv/chaines/ut1capitole/rss",
    sourceName: "UT1 Capitole",
  },
  {
    url: "https://www.canal-u.tv/chaines/ut2j/rss", 
    sourceName: "UT2J",
  },
  // L'URL pour ENSA Toulouse est encodée (espace remplacé par %20)
  {
    url: "https://www.canal-u.tv/chaines/ensa%20de%20toulouse/rss",
    sourceName: "ENSA Toulouse",
  },
];

const parser = new Parser();

// --- Fonction de Traitement d'un seul Flux ---

/**
 * Récupère et parse un flux RSS donné, en lui assignant une source.
 */
async function fetchAndParseFeed(config: { url: string, sourceName: string }): Promise<Event[]> {
  try {
    const feed = await parser.parseURL(config.url);

    const events: Event[] = (feed.items || [])
      .map((item: RawItem): Event => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        return {
          id: item.guid || item.link || item.title || Math.random().toString(),
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content || item.summary || "",
          start: pubDate ? pubDate.toISOString() : "",
          end: null,
          location: null,
          image: null, 
          url: item.link || "",
          source: config.sourceName, // Attribution de la source pour la vision par source
        };
      })
      .filter(ev => ev.start); 
      
    console.log(`✅ ${events.length} événements récupérés de ${config.sourceName}`);
    return events;

  } catch (err) {
    console.error(`❌ Erreur lors de la récupération du RSS (${config.sourceName}):`, err);
    return []; // Retourne un tableau vide en cas d'erreur
  }
}

// --- Fonction Principale (GET Handler) ---

export async function GET(req: NextRequest) {
  // Exécute la récupération et le parsing de tous les flux en parallèle
  const results = await Promise.all(RSS_CONFIGS.map(fetchAndParseFeed));

  // Combine tous les résultats en un seul tableau
  const allEvents: Event[] = results.flat();

  // Trie tous les événements par date de publication (du plus ancien au plus récent)
  allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (allEvents.length === 0) {
    return NextResponse.json(
      { error: "Impossible de récupérer les événements d'aucune source" },
      { status: 500 }
    );
  }

  return NextResponse.json(allEvents);
}