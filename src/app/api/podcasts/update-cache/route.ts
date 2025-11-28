import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import RssParser from "rss-parser";

// --- Configuration des flux RSS ---
const FEEDS: Record<string, string> = {
  "Terra Nova": "https://www.vodio.fr/rssmedias.php?valeur=636",
  "Ombres Blanches": "https://feed.ausha.co/kk2J1iKdlOXE",
  "Librairie Mollat": "https://feed.ausha.co/rss/librairie-mollat",
  "Marathon des Mots": "https://feed.ausha.co/BnYn5Uw5W3WO",
};

interface PodcastEpisode {
  librairie: string;
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
}

const parser = new RssParser();
const CACHE_PATH = path.join(process.cwd(), "data", "podcasts-cache.json");

/**
 * Parse un flux RSS et renvoie une liste d'épisodes formatée.
 */
async function fetchAndParseFeed(
  feedUrl: string,
  librairie: string
): Promise<PodcastEpisode[]> {
  if (feedUrl.includes("YOUR_")) {
    console.warn(`[SKIP] Flux non configuré : ${librairie}`);
    return [];
  }

  try {
    const feed = await parser.parseURL(feedUrl);

    const episodes = feed.items
      .map((item) => {
        const audioUrl = item.enclosure?.url;
        const title = item.title;
        const date = item.isoDate || item.pubDate;

        if (!audioUrl || !title || !date) return null;

        return {
          librairie,
          titre: title,
          date,
          description: item.content || item.contentSnippet || "Pas de description disponible",
          audioUrl,
        };
      })
      .filter((ep): ep is PodcastEpisode => ep !== null);

    console.log(`[OK] ${librairie}: ${episodes.length} épisodes.`);
    return episodes;
  } catch (error) {
    console.error(`[ERREUR] Flux ${librairie} (${feedUrl})`, error);
    return [];
  }
}

/**
 * Route GET : met à jour le cache des podcasts.
 */
export async function GET() {
  console.log("--- Mise à jour du cache des podcasts ---");

  try {
    const results = await Promise.all(
      Object.entries(FEEDS).map(([name, url]) =>
        fetchAndParseFeed(url, name)
      )
    );

    const episodes = results.flat();

    if (episodes.length === 0) {
      return NextResponse.json(
        { error: "Aucun épisode récupéré. Vérifiez les flux RSS." },
        { status: 500 }
      );
    }

    // Création du dossier /data si absent
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });

    // Écriture du cache
    await fs.writeFile(CACHE_PATH, JSON.stringify(episodes, null, 2), "utf-8");

    console.log(`--- Cache mis à jour (${episodes.length} épisodes) ---`);

    return NextResponse.json(
      {
        message: "Cache mis à jour avec succès",
        totalEpisodes: episodes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur critique:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour du cache" },
      { status: 500 }
    );
  }
}
