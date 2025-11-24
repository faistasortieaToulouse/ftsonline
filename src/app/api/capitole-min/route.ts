import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

/* ------------------------------------------------------------------
   Récupération flux UT Capitole : Événements / Colloques / Séminaires
   (revues et colloques universitaires = seules sources RSS publiques stables)
------------------------------------------------------------------- */
const FEEDS = [
  "https://neeo.univ-tlse1.fr/rss?scope=colloques", 
  "https://neeo.univ-tlse1.fr/rss?scope=seminaires",
  "https://neeo.univ-tlse1.fr/rss?scope=publications"
];

const KEYWORDS = ["ciné", "cine", "conf", "expo"];

export async function GET() {
  try {
    let allEvents: any[] = [];

    for (const url of FEEDS) {
      try {
        const feed = await parser.parseURL(url);

        feed.items.forEach((item) => {
          const title = item.title?.trim() ?? "";
          const lower = title.toLowerCase();
          const match = KEYWORDS.some((k) => lower.includes(k));

          if (!match) return;

          allEvents.push({
            id: item.guid || item.id || title,
            title,
            description: item.contentSnippet || item.content || "",
            url: item.link || "",
            start: item.isoDate || "",
            end: item.isoDate || "",
            location: "",
            source: "Université Toulouse Capitole",
          });
        });

      } catch (err) {
        console.error("Flux UT Capitole inaccessible :", url);
      }
    }

    return NextResponse.json(allEvents);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors du traitement du flux Capitole" },
      { status: 500 }
    );
  }
}
