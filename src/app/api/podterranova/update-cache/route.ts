import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import RssParser from "rss-parser";

// Flux Terra Nova uniquement
const FEED_URL = "https://www.vodio.fr/rssmedias.php?valeur=636";

interface TerraNovaEpisode {
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
  guid: string;
  image?: string | null;
  link?: string | null;
}

const parser = new RssParser();

// Cache dédié
const CACHE_PATH = path.join(process.cwd(), "data", "podterranova-cache.json");

/**
 * Parse le flux Terra Nova et formatte les épisodes.
 */
async function fetchTerraNovaFeed(): Promise<TerraNovaEpisode[]> {
  try {
    const feed = await parser.parseURL(FEED_URL);

    const episodes = feed.items
      .map((item) => {
        if (!item.title || !item.pubDate || !item.enclosure?.url || !item.guid)
          return null;

        return {
          guid: item.guid,
          titre: item.title,
          date: item.isoDate || item.pubDate,
          audioUrl: item.enclosure.url,
          description:
            item["content:encoded"] ||
            item.content ||
            item.contentSnippet ||
            "Pas de description",
          image:
            item.itunes?.image ||
            item.image?.url ||
            null,
          link: item.link || null,
        } satisfies TerraNovaEpisode;
      })
      .filter((ep): ep is TerraNovaEpisode => ep !== null);

    console.log(`[OK] Terra Nova : ${episodes.length} épisodes récupérés.`);
    return episodes;
  } catch (error) {
    console.error("[ERREUR] Impossible de charger Terra Nova :", error);
    return [];
  }
}

/**
 * Route GET : met à jour le cache Terra Nova.
 */
export async function GET() {
  console.log("--- Mise à jour du cache Terra Nova ---");

  try {
    const episodes = await fetchTerraNovaFeed();

    if (episodes.length === 0) {
      return NextResponse.json(
        { error: "Aucun épisode Terra Nova récupéré." },
        { status: 500 }
      );
    }

    // Crée /data si nécessaire
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });

    // Écrit le fichier cache
    await fs.writeFile(CACHE_PATH, JSON.stringify(episodes, null, 2), "utf-8");

    console.log(`--- Cache TerraNova mis à jour (${episodes.length} épisodes) ---`);

    return NextResponse.json(
      {
        message: "Cache TerraNova mis à jour",
        totalEpisodes: episodes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur critique TerraNova:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour du cache Terra Nova" },
      { status: 500 }
    );
  }
}
