// src/app/api/podmollat/update-cache/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import RssParser from "rss-parser";

const FEED_URL = "https://www.vodio.fr/rssmedias.php?valeur=636";

interface mollatEpisode {
  titre: string;
  date: string;
  audioUrl: string;
  description: string;
  guid: string;
  image?: string | null;
  link?: string | null;
}

const parser = new RssParser();
const CACHE_PATH = path.join(process.cwd(), "data", "podmollat-cache.json");

async function fetchmollatFeed(): Promise<mollatEpisode[]> {
  try {
    const feed = await parser.parseURL(FEED_URL);
    const episodes = feed.items
      .map(item => {
        if (!item.title || !item.pubDate || !item.enclosure?.url || !item.guid) return null;
        return {
          guid: item.guid,
          titre: item.title,
          date: item.isoDate || item.pubDate,
          audioUrl: item.enclosure.url,
          description: item["content:encoded"] || item.content || item.contentSnippet || "Pas de description",
          image: item.itunes?.image || item.image?.url || null,
          link: item.link || null,
        } satisfies mollatEpisode;
      })
      .filter((ep): ep is mollatEpisode => ep !== null);

    console.log(`[OK] Mollat : ${episodes.length} épisodes récupérés.`);
    return episodes;
  } catch (error) {
    console.error("[ERREUR] Impossible de charger Mollat :", error);
    return [];
  }
}

export async function GET() {
  try {
    const episodes = await fetchmollatFeed();
    if (episodes.length === 0) {
      return NextResponse.json(
        { error: "Aucun épisode Mollat récupéré." },
        { status: 500 }
      );
    }

    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await fs.writeFile(CACHE_PATH, JSON.stringify(episodes, null, 2), "utf-8");

    console.log(`--- Cache mollat mis à jour (${episodes.length} épisodes) ---`);

    return NextResponse.json(
      {
        message: "Cache mollat mis à jour",
        totalEpisodes: episodes.length,
        episodes, // renvoie la liste complète pour un appel direct côté serveur
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur critique mollat:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour du cache Mollat" },
      { status: 500 }
    );
  }
}
