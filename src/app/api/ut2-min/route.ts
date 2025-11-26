import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

type RawItem = Parser.Item;

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;        // date ISO (publication date)
  end: string | null;   // pas d’heure de fin pour un flux RSS
  location: string | null;
  image: string | null;
  url: string;
  source: string;
  // tu peux ajouter d’autres champs selon besoin  
}

const RSS_URL = "https://www.canal-u.tv/chaines/ut2j/rss";

export async function GET(req: NextRequest) {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL(RSS_URL);

    const events: Event[] = (feed.items || [])
      .map((item: RawItem) => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        return {
          id: item.guid || item.link || item.title || Math.random().toString(),
          title: item.title || "Untitled",
          description: item.contentSnippet || item.content || item.summary || "",
          start: pubDate ? pubDate.toISOString() : "",
          end: null,
          location: null,      // le flux RSS ne fournit pas de lieu — tu peux adapter si tu as ce champ
          image: null,         // si le flux ne fournit pas d’image, tu peux mettre une image par défaut
          url: item.link || "",
          source: "UT2J‑Canal‑U",
        };
      })
      // Optionnel : filtrer selon date, validité, etc.
      .filter(ev => ev.start); // ici on ne garde que ceux ayant une date valide

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("Erreur lors de la récupération du RSS UT2J :", err);
    return NextResponse.json(
      { error: "Impossible de récupérer les événements UT2J" },
      { status: 500 }
    );
  }
}
