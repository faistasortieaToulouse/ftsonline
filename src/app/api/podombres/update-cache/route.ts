import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";

const CACHE_PATH = path.join(process.cwd(), "data", "podombres-cache.json");

export async function GET() {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL("https://feed.ausha.co/kk2J1iKdlOXE");

    // Extraire les épisodes dans le format attendu
    const episodes = feed.items.map(item => ({
      titre: item.title || "Sans titre",
      date: item.isoDate || item.pubDate || new Date().toISOString(),
      description: item.content || item.contentEncoded || item.description || "",
      audioUrl: item.enclosure?.url || "",
      guid: item.guid || "",
    }));

    // Créer le dossier data si nécessaire
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });

    // Écrire le cache
    await fs.writeFile(CACHE_PATH, JSON.stringify(episodes, null, 2), "utf-8");

    console.log(`Cache podombres mis à jour : ${episodes.length} épisodes`);

    return NextResponse.json({ totalEpisodes: episodes.length, episodes }, { status: 200 });
  } catch (err) {
    console.error("Erreur update-cache podombres:", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le cache podombres" },
      { status: 500 }
    );
  }
}
