import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser();

// Liste des flux RSS / Atom
const FEEDS: Record<string, string> = {
  "Terra Nova": "https://www.vodio.fr/rssmedias.php?valeur=636",
  "Ombres Blanches": "https://feed.ausha.co/kk2J1iKdlOXE",
  "Librairie Mollat": "https://feed.ausha.co/rss/librairie-mollat",
  "Marathon des Mots": "https://feed.ausha.co/BnYn5Uw5W3WO",
};

export async function GET() {
  const allEpisodes: any[] = [];
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const [name, url] of Object.entries(FEEDS)) {
    try {
      // Fetch avec User-Agent pour Ausha
      const text = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MyPodcastFetcher/1.0)" }
      }).then(res => res.text());

      const feed = await parser.parseString(text);

      if (!feed.items || feed.items.length === 0) {
        console.warn(`⚠️ Le flux "${name}" est vide`);
        continue;
      }

      feed.items.forEach(item => {
        allEpisodes.push({
          librairie: name,
          titre: item.title || "Sans titre",
          audioUrl: item.enclosure?.url || item.link || "",
          date: item.pubDate || item.isoDate || "",
          description: item.contentSnippet || item.description || "",
        });
      });

      console.log(`✅ "${name}" récupéré : ${feed.items.length} épisodes`);
    } catch (err: any) {
      console.error(`⚠️ Impossible de récupérer le flux "${name}" :`, err.message);
      // Continue avec les autres flux
    }
  }

  // Création du fichier cache
  const filePath = path.join(dir, "podcasts-cache.json");
  fs.writeFileSync(filePath, JSON.stringify(allEpisodes, null, 2));

  return NextResponse.json({
    ok: true,
    count: allEpisodes.length,
    warning: allEpisodes.length === 0 ? "Aucun flux n'a répondu" : undefined,
  });
}
